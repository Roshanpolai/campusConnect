import { useEffect, useState } from "react";
import { Search, Plus, FileText, Download, BookOpen, Clock } from "lucide-react";
import api from "../../../api/axios.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { RESOURCE_TYPES } from "../../../utils/constants.js";
import Badge from "../../../components/ui/Badge.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import FileUploadField from "../../../components/ui/FileUploadField.jsx";
import { SkeletonGrid } from "../../../components/ui/Skeleton.jsx";

const EMPTY_FORM = { title: "", description: "", type: "Notes", subject: "" };

export default function Resources() {
  const { user } = useAuth();
  const [tab, setTab] = useState("browse");
  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");
  const [resources, setResources] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadBrowse = () => {
    setLoading(true);
    api
      .get("/resources", { params: { type, search, department: user?.department, year: user?.year } })
      .then(({ data }) => setResources(data.resources || []))
      .finally(() => setLoading(false));
  };

  const loadMine = () => {
    setLoading(true);
    api.get("/resources/mine").then(({ data }) => setMine(data.resources || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === "browse") loadBrowse();
    else loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, type, search]);

  const submitUpload = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!file) {
      setSubmitError("Please attach a file before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/resources", {
        ...form,
        ...file,
        department: user.department,
        year: user.year,
        section: user.section,
      });
      setShowModal(false);
      setForm(EMPTY_FORM);
      setFile(null);
      setTab("mine");
      loadMine();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const trackDownload = (id) => api.put(`/resources/${id}/download`).catch(() => {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex gap-2 rounded-xl bg-surface-card border border-surface-border p-1">
          <button onClick={() => setTab("browse")} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === "browse" ? "bg-primary-gradient text-white shadow-glow" : "text-ink-500 hover:text-ink-900"}`}>
            Browse
          </button>
          <button onClick={() => setTab("mine")} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === "mine" ? "bg-primary-gradient text-white shadow-glow" : "text-ink-500 hover:text-ink-900"}`}>
            My Uploads
          </button>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary shrink-0"><Plus size={16} /> Upload</button>
      </div>

      {tab === "browse" && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {["All", ...RESOURCE_TYPES].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-pill px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                    type === t ? "bg-primary-500 border-primary-500 text-white" : "border-surface-border text-ink-500 hover:border-primary-300 hover:text-primary-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title..." className="input-field pl-9" />
            </div>
          </div>
          <p className="text-xs text-ink-400">Showing resources for {user?.department} · {user?.year}</p>

          {loading ? (
            <SkeletonGrid />
          ) : resources.length === 0 ? (
            <EmptyState icon={BookOpen} title="No resources yet" description="Be the first to share notes or a question paper for your class." action={<button onClick={() => setShowModal(true)} className="btn-primary">Upload a resource</button>} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((r) => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600"><FileText size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{r.title}</p>
                      <p className="text-xs text-ink-500">{r.subject}</p>
                    </div>
                    <Badge variant="core">{r.type}</Badge>
                  </div>
                  {r.description && <p className="mt-2 line-clamp-2 text-xs text-ink-500">{r.description}</p>}
                  <p className="mt-2 text-[11px] text-ink-400">Shared by {r.uploadedBy?.fullName || "a student"}</p>
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    onClick={() => trackDownload(r._id)}
                    className="btn-secondary w-full mt-3 !py-1.5 text-xs"
                  >
                    <Download size={13} /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "mine" && (
        loading ? (
          <SkeletonGrid />
        ) : mine.length === 0 ? (
          <EmptyState icon={Clock} title="No uploads yet" description="Notes and question papers you upload will show up here with their review status." />
        ) : (
          <div className="space-y-3">
            {mine.map((r) => (
              <div key={r._id} className="card flex items-center gap-3 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-ink-500"><FileText size={18} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{r.title}</p>
                  <p className="text-xs text-ink-500">{r.type} · {r.subject}</p>
                  {r.status === "rejected" && r.reviewNote && <p className="mt-1 text-xs text-rose-500">Reason: {r.reviewNote}</p>}
                </div>
                <Badge variant={r.status === "approved" ? "active" : r.status === "rejected" ? "expired" : "pending"}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Upload Notes / PYQ / Resource" size="lg">
        <form onSubmit={submitUpload} className="space-y-4">
          <p className="rounded-xl bg-primary-50 px-3 py-2 text-xs text-primary-700">
            Your upload goes live only after a moderator or admin reviews and approves it.
          </p>
          <div>
            <label className="label-field">Title</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {RESOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Subject</label>
              <input required className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-field">Description (optional)</label>
            <textarea rows={2} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <FileUploadField value={file} onChange={setFile} folder="notes" label="File (PDF, Word, PPT, or ZIP)" />
          {submitError && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{submitError}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
