import { useEffect, useState } from "react";
import { Users, PartyPopper, Briefcase, MessageSquareText } from "lucide-react";
import api from "../../api/axios.js";
import { SkeletonGrid } from "../../components/ui/Skeleton.jsx";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, events: 0, jobs: 0, feedback: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.get("/users"),
      api.get("/events"),
      api.get("/jobs"),
      api.get("/feedback"),
    ]).then(([u, e, j, f]) => {
      setStats({
        users: u.status === "fulfilled" ? u.value.data.count : 0,
        events: e.status === "fulfilled" ? e.value.data.count : 0,
        jobs: j.status === "fulfilled" ? j.value.data.count : 0,
        feedback: f.status === "fulfilled" ? (f.value.data.feedback || []).filter((x) => x.status === "Pending").length : 0,
      });
      setRecentJobs(j.status === "fulfilled" ? j.value.data.jobs.slice(0, 4) : []);
      setRecentFeedback(f.status === "fulfilled" ? f.value.data.feedback.slice(0, 4) : []);
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, tint: "bg-primary-50 text-primary-600" },
    { label: "Events", value: stats.events, icon: PartyPopper, tint: "bg-rose-50 text-rose-600" },
    { label: "Job Posts", value: stats.jobs, icon: Briefcase, tint: "bg-sky-50 text-sky-600" },
    { label: "Pending Feedback", value: stats.feedback, icon: MessageSquareText, tint: "bg-amber-50 text-amber-600" },
  ];

  if (loading) return <SkeletonGrid count={8} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Admin Dashboard</h1>
        <p className="text-sm text-ink-500">Overview of platform activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="card p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}>
              <Icon size={19} />
            </div>
            <p className="mt-3 text-2xl font-bold text-ink-900">{value}</p>
            <p className="text-sm text-ink-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">Recent Job Posts</h2>
          <div className="space-y-3">
            {recentJobs.length === 0 && <p className="text-sm text-ink-400">No jobs posted yet.</p>}
            {recentJobs.map((j) => (
              <div key={j._id} className="flex items-center justify-between rounded-xl border border-surface-border p-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{j.companyName} · {j.title}</p>
                  <p className="text-xs text-ink-500">{j.location} · {new Date(j.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">Recent Feedback</h2>
          <div className="space-y-3">
            {recentFeedback.length === 0 && <p className="text-sm text-ink-400">No feedback submitted yet.</p>}
            {recentFeedback.map((f) => (
              <div key={f._id} className="flex items-center justify-between rounded-xl border border-surface-border p-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{f.subject}</p>
                  <p className="text-xs text-ink-500">{f.student?.fullName} · {new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
