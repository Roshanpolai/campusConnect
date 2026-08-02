import { useEffect, useState } from "react";
import { Search, Plus, Bookmark, BookmarkCheck, Store } from "lucide-react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { SkeletonGrid } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Modal from "../../components/ui/Modal.jsx";
import ImageUploadField from "../../components/ui/ImageUploadField.jsx";

const CATEGORIES = ["All", "Books", "Electronics", "Furniture", "Sports", "Fashion", "Other"];

export default function Marketplace() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", category: "Books", image: "", description: "" });

  const load = () => {
    setLoading(true);
    api.get("/marketplace", { params: { search, category } }).then(({ data }) => setProducts(data.products || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const toggleSave = async (id) => {
    const { data } = await api.put(`/marketplace/${id}/save`);
    setProducts((prev) =>
      prev.map((p) =>
        p._id === id
          ? { ...p, savedBy: data.saved ? [...(p.savedBy || []), user._id] : (p.savedBy || []).filter((s) => s !== user._id) }
          : p
      )
    );
  };

  const submitListing = async (e) => {
    e.preventDefault();
    await api.post("/marketplace", { ...form, price: Number(form.price) });
    setShowModal(false);
    setForm({ name: "", price: "", category: "Books", image: "", description: "" });
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Marketplace</h1>
          <p className="text-sm text-ink-500">Buy and sell with fellow students.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="input-field pl-9 w-full sm:w-56" />
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary shrink-0"><Plus size={16} /> Sell Item</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-pill px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              category === c ? "bg-primary-500 border-primary-500 text-white" : "border-surface-border text-ink-500 hover:border-primary-300 hover:text-primary-600"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : products.length === 0 ? (
        <EmptyState icon={Store} title="No listings yet" description="Be the first to sell something on campus." action={<button onClick={() => setShowModal(true)} className="btn-primary">Sell an item</button>} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const isSaved = p.savedBy?.includes(user?._id);
            return (
              <div key={p._id} className="card overflow-hidden group">
                <div className="relative aspect-square overflow-hidden bg-surface">
                  {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                  <button onClick={() => toggleSave(p._id)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink-500 hover:text-primary-600">
                    {isSaved ? <BookmarkCheck size={15} className="text-primary-600" /> : <Bookmark size={15} />}
                  </button>
                </div>
                <div className="p-3.5">
                  <p className="truncate text-sm font-medium text-ink-900">{p.name}</p>
                  <p className="text-sm font-bold text-primary-600">₹{p.price}</p>
                  <p className="mt-1 truncate text-xs text-ink-500">{p.seller?.fullName} · {p.category}</p>
                  <a
                    href={`mailto:${p.seller?.email || ""}`}
                    className="btn-secondary w-full mt-3 !py-1.5 text-xs"
                  >
                    Contact Seller
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Sell an item">
        <form onSubmit={submitListing} className="space-y-4">
          <div>
            <label className="label-field">Product Name</label>
            <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Price (₹)</label>
              <input type="number" required className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <ImageUploadField value={form.image} onChange={(url) => setForm({ ...form, image: url })} folder="marketplace" label="Product Image" />
          <div>
            <label className="label-field">Description</label>
            <textarea rows={3} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">List Item</button>
        </form>
      </Modal>
    </div>
  );
}
