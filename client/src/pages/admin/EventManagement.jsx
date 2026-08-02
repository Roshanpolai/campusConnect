import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import api from "../../api/axios.js";
import Modal from "../../components/ui/Modal.jsx";
import { SkeletonRow } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ImageUploadField from "../../components/ui/ImageUploadField.jsx";

const EMPTY_FORM = { name: "", description: "", category: "Technical", venue: "", date: "", time: "", organizer: "", banner: "" };

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [registrations, setRegistrations] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/events").then(({ data }) => setEvents(data.events || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (ev) => { setForm({ ...ev, date: ev.date?.slice(0, 10) }); setEditingId(ev._id); setShowModal(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.put(`/events/${editingId}`, form);
    else await api.post("/events", form);
    setShowModal(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this event?")) return;
    await api.delete(`/events/${id}`);
    load();
  };

  const viewRegistrations = async (id) => {
    const { data } = await api.get(`/events/${id}/registrations`);
    setRegistrations(data.registrations);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Event Management</h1>
          <p className="text-sm text-ink-500">Create, edit, and track campus events.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Create Event</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Registrations</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>)}
            {!loading && events.length === 0 && <tr><td colSpan={5}><EmptyState title="No events yet" description="Create your first campus event." /></td></tr>}
            {!loading && events.map((ev) => (
              <tr key={ev._id} className="border-b border-surface-border last:border-0 hover:bg-surface/60">
                <td className="px-4 py-3 font-medium text-ink-900">{ev.name}</td>
                <td className="px-4 py-3 text-ink-700">{ev.category}</td>
                <td className="px-4 py-3 text-ink-700">{new Date(ev.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-ink-700">{ev.registeredStudents?.length || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => viewRegistrations(ev._id)} className="btn-ghost !p-2" title="View registrations"><Users size={15} /></button>
                    <button onClick={() => openEdit(ev)} className="btn-ghost !p-2" title="Edit"><Pencil size={15} /></button>
                    <button onClick={() => remove(ev._id)} className="btn-ghost !p-2" title="Delete"><Trash2 size={15} className="text-rose-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Event" : "Create Event"} size="lg">
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label-field">Event Name</label><input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label-field">Description</label><textarea rows={3} required className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <label className="label-field">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {["Technical", "Cultural", "Sports", "Workshop"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label-field">Venue</label><input required className="input-field" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
          <div><label className="label-field">Date</label><input type="date" required className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><label className="label-field">Time</label><input required placeholder="e.g. 5:00 PM" className="input-field" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          <div><label className="label-field">Organizer</label><input required className="input-field" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} /></div>
          <div className="sm:col-span-2">
            <ImageUploadField value={form.banner} onChange={(url) => setForm({ ...form, banner: url })} folder="events" label="Event Banner" />
          </div>
          <button type="submit" className="btn-primary sm:col-span-2">{editingId ? "Save Changes" : "Create Event"}</button>
        </form>
      </Modal>

      <Modal open={!!registrations} onClose={() => setRegistrations(null)} title="Registered Students">
        <div className="space-y-2">
          {registrations?.length === 0 && <p className="text-sm text-ink-400">No registrations yet.</p>}
          {registrations?.map((s) => (
            <div key={s._id} className="flex items-center justify-between rounded-xl border border-surface-border px-3 py-2">
              <div>
                <p className="text-sm font-medium text-ink-900">{s.fullName}</p>
                <p className="text-xs text-ink-500">{s.email}</p>
              </div>
              <span className="text-xs text-ink-500">{s.department}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
