import { useEffect, useState } from "react";
import { Plus, Trash2, Calculator, Save, RotateCcw } from "lucide-react";

const GRADE_POINTS = {
  O: 10,
  E: 9,
  A: 8,
  B: 7,
  C: 6,
  D: 5,
  F: 0,
  S: 0,
  X: 0
};
const STORAGE_KEY = "cc_cgpa_history";

const emptyCourse = () => ({ id: crypto.randomUUID(), subject: "", credit: 3, grade: "A" });

export default function CgpaCalculator() {
  const [courses, setCourses] = useState([emptyCourse()]);
  const [semesterLabel, setSemesterLabel] = useState("Semester 1");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const updateCourse = (id, field, value) =>
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const addCourse = () => setCourses((prev) => [...prev, emptyCourse()]);
  const removeCourse = (id) => setCourses((prev) => prev.filter((c) => c.id !== id));

  const totalCredits = courses.reduce((sum, c) => sum + Number(c.credit || 0), 0);
  const totalPoints = courses.reduce((sum, c) => sum + Number(c.credit || 0) * GRADE_POINTS[c.grade], 0);
  const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  const overallCredits = history.reduce((sum, h) => sum + h.credits, 0) + totalCredits;
  const overallPoints = history.reduce((sum, h) => sum + h.credits * h.sgpa, 0) + totalPoints;
  const cgpa = overallCredits > 0 ? overallPoints / overallCredits : 0;

  const saveSemester = () => {
    if (totalCredits === 0) return;
    setHistory((prev) => [...prev, { id: crypto.randomUUID(), label: semesterLabel, sgpa, credits: totalCredits }]);
    setCourses([emptyCourse()]);
    setSemesterLabel(`Semester ${history.length + 2}`);
  };

  const removeSemester = (id) => setHistory((prev) => prev.filter((h) => h.id !== id));
  const resetAll = () => {
    if (!confirm("Clear all saved semesters and start over?")) return;
    setHistory([]);
    setCourses([emptyCourse()]);
    setSemesterLabel("Semester 1");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs text-ink-500">Current Semester SGPA</p>
          <p className="mt-1 text-3xl font-bold text-primary-600">{sgpa.toFixed(2)}</p>
          <p className="text-xs text-ink-400">{totalCredits} credits this semester</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-ink-500">Overall CGPA (incl. saved semesters)</p>
          <p className="mt-1 text-3xl font-bold text-ink-900">{cgpa.toFixed(2)}</p>
          <p className="text-xs text-ink-400">{overallCredits} total credits</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            className="input-field w-full sm:w-56"
            value={semesterLabel}
            onChange={(e) => setSemesterLabel(e.target.value)}
            placeholder="Semester name"
          />
          <button type="button" onClick={addCourse} className="btn-secondary !py-1.5 text-xs"><Plus size={14} /> Add Course</button>
        </div>

        <div className="space-y-2">
          {courses.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-xl border border-surface-border p-2.5 sm:grid-cols-[2fr_1fr_1fr_auto]">
              <input
                placeholder="Subject (optional)"
                className="input-field !py-2 text-xs"
                value={c.subject}
                onChange={(e) => updateCourse(c.id, "subject", e.target.value)}
              />
              <input
                type="number"
                min={1}
                max={10}
                placeholder="Credits"
                className="input-field !py-2 text-xs"
                value={c.credit}
                onChange={(e) => updateCourse(c.id, "credit", e.target.value)}
              />
              <select className="input-field !py-2 text-xs" value={c.grade} onChange={(e) => updateCourse(c.id, "grade", e.target.value)}>
                {Object.keys(GRADE_POINTS).map((g) => (
                  <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>
                ))}
              </select>
              <button type="button" onClick={() => removeCourse(c.id)} className="btn-ghost !p-2 justify-self-end"><Trash2 size={14} className="text-rose-500" /></button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={saveSemester} className="btn-primary"><Save size={15} /> Save Semester to CGPA</button>
          <button type="button" onClick={resetAll} className="btn-ghost text-rose-500"><RotateCcw size={15} /> Reset All</button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900"><Calculator size={16} /> Saved Semesters</h2>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl border border-surface-border px-3 py-2.5 text-sm">
                <span className="font-medium text-ink-900">{h.label}</span>
                <span className="text-ink-500">{h.credits} credits</span>
                <span className="font-semibold text-primary-600">SGPA {h.sgpa.toFixed(2)}</span>
                <button onClick={() => removeSemester(h.id)} className="btn-ghost !p-1.5"><Trash2 size={13} className="text-rose-500" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-ink-400">
        Uses the standard 10-point scale (O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0). Saved semesters are stored only
        on this device — they aren't sent to the server.
      </p>
    </div>
  );
}
