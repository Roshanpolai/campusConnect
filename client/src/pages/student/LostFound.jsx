import { useEffect, useState } from "react";
import { Plus, MapPin, Calendar, Search as SearchIcon } from "lucide-react";
import api from "../../api/axios.js";
import { SkeletonGrid } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Modal from "../../components/ui/Modal.jsx";
import ImageUploadField from "../../components/ui/ImageUploadField.jsx";

export default function LostFound() {
  const [tab, setTab] = useState("lost");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "lost", itemName: "", description: "", location: "", date: "", contactInfo: "", image: "" });

  const load = () => {
    setLoading(true);
    api.get("/lostfound", { params: { type: tab } }).then(({ data }) => setItems(data.items || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const submitReport = async (e) => {
    e.preventDefault();
    await api.post("/lostfound", form);
    setShowModal(false);
    setForm({ type: tab, itemName: "", description: "", location: "", date: "", contactInfo: "", image: "" });
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Lost & Found</h1>
          <p className="text-sm text-ink-500">Report a missing item or help reunite something with its owner.</p>
        </div>
        <button onClick={() => { setForm((f) => ({ ...f, type: tab })); setShowModal(true); }} className="btn-primary shrink-0">
          <Plus size={16} /> Report Item
        </button>
      </div>

      <div className="inline-flex gap-2 rounded-xl bg-surface-card border border-surface-border p-1">
        <button onClick={() => setTab("lost")} className={`rounded-lg px-5 py-1.5 text-sm font-medium transition-colors ${tab === "lost" ? "bg-primary-gradient text-white shadow-glow" : "text-ink-500 hover:text-ink-900"}`}>
          Lost
        </button>
        <button onClick={() => setTab("found")} className={`rounded-lg px-5 py-1.5 text-sm font-medium transition-colors ${tab === "found" ? "bg-primary-gradient text-white shadow-glow" : "text-ink-500 hover:text-ink-900"}`}>
          Found
        </button>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : items.length === 0 ? (
        <EmptyState icon={SearchIcon} title={`No ${tab} items reported`} description="Reports will show up here once submitted." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="card overflow-hidden">
              <div className="h-32 bg-surface">
                {item.image && <img src={item.image} alt={item.itemName} className="h-full w-full object-cover" />}
              </div>
              <div className="p-4">
                <p className="font-semibold text-ink-900">{item.itemName}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-500">{item.description}</p>
                <div className="mt-2 space-y-1 text-xs text-ink-500">
                  <p className="flex items-center gap-1.5"><MapPin size={13} /> {item.location}</p>
                  <p className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(item.date).toLocaleDateString()}</p>
                </div>
                <a href={`tel:${item.contactInfo}`} className="btn-secondary w-full mt-3 !py-1.5 text-xs">Contact Owner</a>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Report an item">
        <form onSubmit={submitReport} className="space-y-4">
          <div className="flex gap-2">
            {["lost", "found"].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium capitalize ${form.type === t ? "border-primary-500 bg-primary-50 text-primary-700" : "border-surface-border text-ink-500"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div>
            <label className="label-field">Item Name</label>
            <input required className="input-field" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea rows={3} required className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Location</label>
              <input required className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Date</label>
              <input type="date" required className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <ImageUploadField value={form.image} onChange={(url) => setForm({ ...form, image: url })} folder="lostfound" label="Item Photo (optional)" />
          <div>
            <label className="label-field">Contact Info</label>
            <input required placeholder="Phone or email" className="input-field" value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">Submit Report</button>
        </form>
      </Modal>
    </div>
  );
}
