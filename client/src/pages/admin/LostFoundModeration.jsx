import { useEffect, useState } from "react";
import { Trash2, CheckCircle2 } from "lucide-react";
import api from "../../api/axios.js";
import Badge from "../../components/ui/Badge.jsx";
import { SkeletonRow } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

export default function LostFoundModeration() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/lostfound").then(({ data }) => setItems(data.items || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const removeFake = async (id) => {
    if (!confirm("Remove this fake report?")) return;
    await api.delete(`/lostfound/${id}`);
    load();
  };

  const markReturned = async (id) => {
    await api.put(`/lostfound/${id}/moderate`, { status: "returned" });
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Lost & Found Moderation</h1>
        <p className="text-sm text-ink-500">Remove fake reports and mark items as returned.</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>)}
            {!loading && items.length === 0 && <tr><td colSpan={5}><EmptyState title="No reports to review" description="Lost & found reports will show up here." /></td></tr>}
            {!loading && items.map((item) => (
              <tr key={item._id} className="border-b border-surface-border last:border-0 hover:bg-surface/60">
                <td className="px-4 py-3 font-medium text-ink-900">{item.itemName}</td>
                <td className="px-4 py-3 capitalize text-ink-700">{item.type}</td>
                <td className="px-4 py-3 text-ink-700">{item.location}</td>
                <td className="px-4 py-3"><Badge variant={item.status === "open" ? "pending" : "reviewed"}>{item.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => markReturned(item._id)} className="btn-ghost !p-2" title="Mark returned"><CheckCircle2 size={15} className="text-emerald-500" /></button>
                    <button onClick={() => removeFake(item._id)} className="btn-ghost !p-2" title="Remove fake report"><Trash2 size={15} className="text-rose-500" /></button>
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
