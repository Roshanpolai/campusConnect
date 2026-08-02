import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, FileText, Inbox } from "lucide-react";
import api from "../../../api/axios.js";
import Badge from "../../../components/ui/Badge.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import { SkeletonRow } from "../../../components/ui/Skeleton.jsx";

export default function ResourceReview() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/resources/pending").then(({ data }) => setPending(data.resources || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const approve = async (id) => {
    await api.put(`/resources/${id}/approve`);
    load();
  };

  const confirmReject = async () => {
    await api.put(`/resources/${rejecting}/reject`, { reviewNote: reason });
    setRejecting(null);
    setReason("");
    load();
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-500">
        Review notes, previous year question papers, and academic resources uploaded by students before they go live.
      </p>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Uploader</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>)}
            {!loading && pending.length === 0 && (
              <tr><td colSpan={5}><EmptyState icon={Inbox} title="Nothing pending" description="New uploads awaiting review will show up here." /></td></tr>
            )}
            {!loading && pending.map((r) => (
              <tr key={r._id} className="border-b border-surface-border last:border-0 hover:bg-surface/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600"><FileText size={15} /></div>
                    <div>
                      <a href={r.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-ink-900 hover:text-primary-600">{r.title}</a>
                      <p className="text-xs text-ink-500">{r.subject}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant="core">{r.type}</Badge></td>
                <td className="px-4 py-3 text-ink-700">{r.department} · {r.year}{r.section ? ` · ${r.section}` : ""}</td>
                <td className="px-4 py-3">
                  <p className="text-ink-700">{r.uploadedBy?.fullName}</p>
                  <p className="text-xs text-ink-500">{r.uploadedBy?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => approve(r._id)} className="btn-ghost !p-2" title="Approve"><CheckCircle2 size={16} className="text-emerald-500" /></button>
                    <button onClick={() => setRejecting(r._id)} className="btn-ghost !p-2" title="Reject"><XCircle size={16} className="text-rose-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject upload">
        <div className="space-y-4">
          <div>
            <label className="label-field">Reason (shown to the uploader)</label>
            <textarea rows={3} className="input-field" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Wrong subject, low quality scan, duplicate upload..." />
          </div>
          <button onClick={confirmReject} className="btn-primary w-full">Confirm Reject</button>
        </div>
      </Modal>
    </div>
  );
}
