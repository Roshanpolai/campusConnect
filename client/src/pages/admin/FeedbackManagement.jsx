import { useEffect, useState } from "react";
import { CheckCircle2, Trash2, Star } from "lucide-react";
import api from "../../api/axios.js";
import Badge from "../../components/ui/Badge.jsx";
import { SkeletonRow } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState([]);
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/feedback", { params: { status } }).then(({ data }) => setFeedback(data.feedback || [])).finally(() => setLoading(false));
  };
  useEffect(load, [status]);

  const markReviewed = async (id) => {
    await api.put(`/feedback/${id}/reviewed`);
    load();
  };

  const removeSpam = async (id) => {
    if (!confirm("Delete this feedback as spam?")) return;
    await api.delete(`/feedback/${id}`);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Feedback Management</h1>
          <p className="text-sm text-ink-500">Review and act on student feedback.</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-auto text-sm">
          {["All", "Pending", "Reviewed"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>)}
            {!loading && feedback.length === 0 && <tr><td colSpan={5}><EmptyState title="No feedback found" description="Feedback matching this filter will show up here." /></td></tr>}
            {!loading && feedback.map((f) => (
              <tr key={f._id} className="border-b border-surface-border last:border-0 hover:bg-surface/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink-900">{f.student?.fullName}</p>
                  <p className="text-xs text-ink-500">{f.student?.email}</p>
                </td>
                <td className="px-4 py-3 text-ink-700">{f.subject}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: f.rating }).map((_, i) => <Star key={i} size={13} className="fill-amber-400" />)}
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant={f.status === "Reviewed" ? "reviewed" : "pending"}>{f.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => markReviewed(f._id)} className="btn-ghost !p-2" title="Mark reviewed"><CheckCircle2 size={15} className="text-emerald-500" /></button>
                    <button onClick={() => removeSpam(f._id)} className="btn-ghost !p-2" title="Delete spam"><Trash2 size={15} className="text-rose-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
