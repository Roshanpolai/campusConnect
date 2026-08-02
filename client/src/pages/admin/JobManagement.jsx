import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Pin, XCircle } from "lucide-react";
import api from "../../api/axios.js";
import Badge from "../../components/ui/Badge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { SkeletonRow } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ImageUploadField from "../../components/ui/ImageUploadField.jsx";

const EMPTY_FORM = {
  companyName: "", companyLogo: "", title: "", jobType: "Internship", workMode: "Remote",
  location: "", salary: "", eligibility: "", deadline: "", applicationLink: "", description: "",
};

export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () => {
    setLoading(true);
    api.get("/jobs", { params: { sort: "latest" } }).then(({ data }) => setJobs(data.jobs || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (job) => {
    setForm({ ...job, deadline: job.deadline?.slice(0, 10) });
    setEditingId(job._id);
    setShowModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.put(`/jobs/${editingId}`, form);
    else await api.post("/jobs", form);
    setShowModal(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this job posting?")) return;
    await api.delete(`/jobs/${id}`);
    load();
  };

  const togglePin = async (job) => {
    await api.put(`/jobs/${job._id}/status`, { pinned: !job.pinned });
    load();
  };

  const markExpired = async (job) => {
    await api.put(`/jobs/${job._id}/status`, { status: job.status === "expired" ? "active" : "expired" });
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Jobs & Internships Management</h1>
          <p className="text-sm text-ink-500">Create and manage community job postings.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Job</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={6}><SkeletonRow /></td></tr>)}
            {!loading && jobs.length === 0 && <tr><td colSpan={6}><EmptyState title="No jobs posted yet" description="Add your first job listing." /></td></tr>}
            {!loading && jobs.map((job) => (
              <tr key={job._id} className="border-b border-surface-border last:border-0 hover:bg-surface/60">
                <td className="px-4 py-3 font-medium text-ink-900">{job.companyName}</td>
                <td className="px-4 py-3 text-ink-700">{job.title}</td>
                <td className="px-4 py-3 text-ink-700">{job.jobType}</td>
                <td className="px-4 py-3 text-ink-700">{new Date(job.deadline).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={job.status === "active" ? "active" : "expired"}>{job.status}</Badge>
                    {job.pinned && <Badge variant="pending">Pinned</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => togglePin(job)} className="btn-ghost !p-2" title="Pin important job"><Pin size={15} className={job.pinned ? "text-primary-600" : ""} /></button>
                    <button onClick={() => markExpired(job)} className="btn-ghost !p-2" title="Toggle expired"><XCircle size={15} /></button>
                    <button onClick={() => openEdit(job)} className="btn-ghost !p-2" title="Edit"><Pencil size={15} /></button>
                    <button onClick={() => remove(job._id)} className="btn-ghost !p-2" title="Delete"><Trash2 size={15} className="text-rose-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Job" : "Create New Job"} size="lg">
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label-field">Company Name</label><input required className="input-field" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
          <div className="sm:col-span-2">
            <ImageUploadField value={form.companyLogo} onChange={(url) => setForm({ ...form, companyLogo: url })} folder="jobs" label="Company Logo" />
          </div>
          <div><label className="label-field">Job Title</label><input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div>
            <label className="label-field">Job Type</label>
            <select className="input-field" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
              {["Internship", "Full Time", "Remote", "Freelance", "Referral"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Work Mode</label>
            <select className="input-field" value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
              {["Onsite", "Remote", "Hybrid"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label-field">Location</label><input required className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><label className="label-field">Salary / Stipend</label><input required className="input-field" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></div>
          <div><label className="label-field">Deadline</label><input type="date" required className="input-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label-field">Eligibility</label><input required className="input-field" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label-field">Application Link</label><input required className="input-field" value={form.applicationLink} onChange={(e) => setForm({ ...form, applicationLink: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label-field">Description</label><textarea rows={4} required className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <button type="submit" className="btn-primary sm:col-span-2">{editingId ? "Save Changes" : "Publish Job"}</button>
        </form>
      </Modal>
    </div>
  );
}
