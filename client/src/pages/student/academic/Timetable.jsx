import { useEffect, useState } from "react";
import { CalendarDays, Download, FileText } from "lucide-react";
import api from "../../../api/axios.js";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import { SkeletonCard } from "../../../components/ui/Skeleton.jsx";

export default function Timetable() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/schedule").then(({ data }) => setSchedule(data.schedule)).finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonCard />;

  if (!schedule) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No timetable published yet"
        description="Your department/year/section's timetable will appear here as soon as an admin uploads it."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
            <FileText size={22} />
          </div>
          <div>
            <p className="font-semibold text-ink-900">{schedule.fileName}</p>
            <p className="text-xs text-ink-500">
              {(schedule.fileSize / 1024 / 1024).toFixed(2)} MB · Updated {new Date(schedule.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <a href={schedule.fileUrl} target="_blank" rel="noreferrer" download className="btn-primary shrink-0">
          <Download size={16} /> Download PDF
        </a>
      </div>

      <div className="card overflow-hidden p-2">
        <iframe src={schedule.fileUrl} title="Timetable" className="h-[75vh] w-full rounded-xl" />
      </div>
    </div>
  );
}
