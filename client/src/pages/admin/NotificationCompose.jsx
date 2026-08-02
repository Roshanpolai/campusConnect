import { useState } from "react";
import { Send } from "lucide-react";
import api from "../../api/axios.js";

const AUDIENCES = ["Everyone", "Students", "Job Posters", "Event Coordinators"];

export default function NotificationCompose() {
  const [form, setForm] = useState({ title: "", message: "", audience: "Everyone", type: "announcement" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/notifications", form);
      setSent(true);
      setForm({ title: "", message: "", audience: "Everyone", type: "announcement" });
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Compose Notification</h1>
        <p className="text-sm text-ink-500">Send an announcement to a specific audience.</p>
      </div>

      <div className="card p-6">
        {sent && <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Notification sent successfully.</p>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-field">Title</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Message</label>
            <textarea rows={4} required className="input-field" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Type</label>
            <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {["announcement", "event", "job", "marketplace"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Audience</label>
            <div className="grid grid-cols-2 gap-2">
              {AUDIENCES.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setForm({ ...form, audience: a })}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${form.audience === a ? "border-primary-500 bg-primary-50 text-primary-700" : "border-surface-border text-ink-500"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={sending} className="btn-primary w-full">
            <Send size={15} /> {sending ? "Sending..." : "Send Notification"}
          </button>
        </form>
      </div>
    </div>
  );
}
