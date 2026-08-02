import { useState } from "react";
import { CalendarDays, Inbox } from "lucide-react";
import TimetableManagement from "./academic/TimetableManagement.jsx";
import ResourceReview from "./academic/ResourceReview.jsx";

const TABS = [
  { id: "timetable", label: "Timetable", icon: CalendarDays },
  { id: "resources", label: "Notes & PYQ Review", icon: Inbox },
];

export default function AcademicManagement() {
  const [tab, setTab] = useState("timetable");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Academic Management</h1>
        <p className="text-sm text-ink-500">Publish timetables and review student-submitted notes & question papers.</p>
      </div>

      <div className="inline-flex gap-2 rounded-xl bg-surface-card border border-surface-border p-1">
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

      {tab === "timetable" && <TimetableManagement />}
      {tab === "resources" && <ResourceReview />}
    </div>
  );
}
