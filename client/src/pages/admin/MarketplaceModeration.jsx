import { useEffect, useState } from "react";
import { Flag, CheckCircle2 } from "lucide-react";
import api from "../../api/axios.js";
import Badge from "../../components/ui/Badge.jsx";
import { SkeletonRow } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

export default function MarketplaceModeration() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/marketplace").then(({ data }) => setProducts(data.products || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const flagScam = async (id) => {
    if (!confirm("Remove this listing as a scam?")) return;
    await api.delete(`/marketplace/${id}`);
    load();
  };

  const markSold = async (id) => {
    await api.put(`/marketplace/${id}/moderate`, { status: "sold" });
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Marketplace Moderation</h1>
        <p className="text-sm text-ink-500">Remove scam listings and mark items as sold.</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>)}
            {!loading && products.length === 0 && <tr><td colSpan={5}><EmptyState title="No listings to review" description="New marketplace listings will show up here." /></td></tr>}
            {!loading && products.map((p) => (
              <tr key={p._id} className="border-b border-surface-border last:border-0 hover:bg-surface/60">
                <td className="px-4 py-3 font-medium text-ink-900">{p.name}</td>
                <td className="px-4 py-3 text-ink-700">{p.seller?.fullName}</td>
                <td className="px-4 py-3 text-ink-700">₹{p.price}</td>
                <td className="px-4 py-3"><Badge variant={p.status === "available" ? "active" : "neutral"}>{p.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => markSold(p._id)} className="btn-ghost !p-2" title="Mark sold"><CheckCircle2 size={15} className="text-emerald-500" /></button>
                    <button onClick={() => flagScam(p._id)} className="btn-ghost !p-2" title="Remove scam listing"><Flag size={15} className="text-rose-500" /></button>
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
