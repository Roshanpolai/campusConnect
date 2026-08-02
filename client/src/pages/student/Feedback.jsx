import { useEffect, useState } from "react";
import { Star, MessageSquareText } from "lucide-react";
import api from "../../api/axios.js";
import Badge from "../../components/ui/Badge.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

const CATEGORIES = ["Academics", "Facilities", "App Experience", "Events", "Other"];

export default function Feedback() {
  const [form, setForm] = useState({ category: "Academics", subject: "", message: "", rating: 5 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get("/feedback/mine").then(({ data }) => setHistory(data.feedback || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/feedback", form);
      setForm({ category: "Academics", subject: "", message: "", rating: 5 });
      load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Feedback</h1>
        <p className="text-sm text-ink-500">Tell us what's working and what could be better.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">Share Your Feedback</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-field">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Subject</label>
              <input required className="input-field" placeholder="Enter your subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Your Feedback</label>
              <textarea rows={4} required className="input-field" placeholder="Write your feedback here..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })}>
                    <Star size={24} className={n <= form.rating ? "fill-amber-400 text-amber-400" : "text-surface-border"} />
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">My Previous Feedback</h2>
          {loading ? (
            <p className="text-sm text-ink-400">Loading...</p>
          ) : history.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="No feedback yet" description="Your submitted feedback will appear here." />
          ) : (
            <div className="space-y-3">
              {history.map((f) => (
                <div key={f._id} className="rounded-xl border border-surface-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink-900">{f.subject}</p>
                    <Badge variant={f.status === "Reviewed" ? "reviewed" : "pending"}>{f.status}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-500">{f.message}</p>
                  <p className="mt-1 text-[11px] text-ink-400">{f.category} · {new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
