import { useEffect, useState } from "react";
import { Upload, Trash2, FileText, CalendarDays } from "lucide-react";
import api from "../../../api/axios.js";
import { DEPARTMENTS, YEARS, SECTIONS } from "../../../utils/constants.js";
import FileUploadField from "../../../components/ui/FileUploadField.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";

export default function TimetableManagement() {
  const [department, setDepartment] = useState(DEPARTMENTS[0].label);
  const [year, setYear] = useState(YEARS[0]);
  const [section, setSection] = useState(SECTIONS[0]);
  const [file, setFile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);

  const loadGroups = () => {
    setLoading(true);
    api.get("/schedule/groups").then(({ data }) => setGroups(data.groups || [])).finally(() => setLoading(false));
  };
  useEffect(loadGroups, []);

  const publish = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Attach a PDF before publishing.");
      return;
    }
    setPublishing(true);
    setMessage("");
    try {
      await api.post("/schedule", { department, year, section, ...file });
      setMessage(`Timetable published for ${department} · ${year} · Section ${section}.`);
      setFile(null);
      loadGroups();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to publish.");
    } finally {
      setPublishing(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Remove this timetable?")) return;
    await api.delete(`/schedule/${id}`);
    loadGroups();
  };

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-900">Upload / Replace Timetable PDF</h2>
        <p className="mb-4 text-xs text-ink-500">
          Take your college's existing timetable PDF (by branch, year, and section) and upload it as-is —
          students in that group see it immediately on their Academic → Timetable tab.
        </p>
        <form onSubmit={publish} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label-field">Department</label>
              <select className="input-field" value={department} onChange={(e) => setDepartment(e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d.label} value={d.label}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Year</label>
              <select className="input-field" value={year} onChange={(e) => setYear(e.target.value)}>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Section</label>
              <select className="input-field" value={section} onChange={(e) => setSection(e.target.value)}>
                {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
          </div>
          <FileUploadField value={file} onChange={setFile} folder="timetables" label="Timetable PDF" accept=".pdf" />
          {message && <p className="rounded-xl bg-primary-50 px-3 py-2 text-sm text-primary-700">{message}</p>}
          <button type="submit" disabled={publishing} className="btn-primary">
            <Upload size={16} /> {publishing ? "Publishing..." : "Publish Timetable"}
          </button>
        </form>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-900">Published Timetables</h2>
        {loading ? (
          <p className="text-sm text-ink-400">Loading...</p>
        ) : groups.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No timetables published yet" description="Use the form above to publish the first one." />
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <div key={g._id} className="flex items-center gap-3 rounded-xl border border-surface-border p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600"><FileText size={16} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{g.department} · {g.year}{g.section ? ` · Section ${g.section}` : ""}</p>
                  <p className="truncate text-xs text-ink-500">{g.fileName} · Updated {new Date(g.updatedAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => remove(g._id)} className="btn-ghost !p-2"><Trash2 size={15} className="text-rose-500" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
