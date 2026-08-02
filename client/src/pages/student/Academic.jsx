import { useState } from "react";
import { CalendarDays, BookOpen, Calculator } from "lucide-react";
import Timetable from "./academic/Timetable.jsx";
import Resources from "./academic/Resources.jsx";
import CgpaCalculator from "./academic/CgpaCalculator.jsx";

const TABS = [
  { id: "timetable", label: "Timetable", icon: CalendarDays },
  { id: "resources", label: "Notes & PYQ", icon: BookOpen },
  { id: "cgpa", label: "CGPA Calculator", icon: Calculator },
];

export default function Academic() {
  const [tab, setTab] = useState("timetable");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Academic</h1>
        <p className="text-sm text-ink-500">Your timetable, class notes, question papers, and CGPA — all in one place.</p>
      </div>

      <div className="inline-flex flex-wrap gap-2 rounded-xl bg-surface-card border border-surface-border p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === id ? "bg-primary-gradient text-white shadow-glow" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === "timetable" && <Timetable />}
      {tab === "resources" && <Resources />}
      {tab === "cgpa" && <CgpaCalculator />}
    </div>
  );
}
