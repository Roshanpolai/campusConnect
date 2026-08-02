import { useState } from "react";
import { Linkedin, Twitter, Instagram, Github, Download, Pencil } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";
import Modal from "../../components/ui/Modal.jsx";
import ImageUploadField from "../../components/ui/ImageUploadField.jsx";
import FileUploadField from "../../components/ui/FileUploadField.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    avatar: user?.avatar || "",
    about: user?.about || "",
    skills: user?.skills?.join(", ") || "",
    achievements: user?.achievements?.join(", ") || "",
    resumeUrl: user?.resumeUrl || "",
    socialLinks: user?.socialLinks || {},
  });
  const [resumeFile, setResumeFile] = useState(user?.resumeUrl ? { fileUrl: user.resumeUrl, fileName: "Current resume" } : null);

  const save = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/users/me", {
      ...form,
      resumeUrl: resumeFile?.fileUrl || "",
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      achievements: form.achievements.split(",").map((s) => s.trim()).filter(Boolean),
    });
    updateUser(data.user);
    setShowEdit(false);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="card p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`}
            alt={user.fullName}
            className="h-24 w-24 rounded-2xl object-cover shadow-soft"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-ink-900">{user.fullName}</h1>
            <p className="text-sm text-ink-500">{user.department} · {user.year}{user.section ? ` · Sec ${user.section}` : ""}</p>
            <p className="mt-2 max-w-lg text-sm text-ink-700">{user.about || "No bio added yet."}</p>
            <div className="mt-3 flex justify-center gap-3 sm:justify-start">
              {user.socialLinks?.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-primary-600"><Linkedin size={18} /></a>}
              {user.socialLinks?.twitter && <a href={user.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-primary-600"><Twitter size={18} /></a>}
              {user.socialLinks?.instagram && <a href={user.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-primary-600"><Instagram size={18} /></a>}
              {user.socialLinks?.github && <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-primary-600"><Github size={18} /></a>}
            </div>
          </div>
          <button onClick={() => setShowEdit(true)} className="btn-primary shrink-0"><Pencil size={15} /> Edit Profile</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills?.length ? user.skills.map((s) => <span key={s} className="badge bg-primary-50 text-primary-700">{s}</span>) : <p className="text-sm text-ink-400">No skills added yet.</p>}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Achievements</h2>
          <ul className="space-y-1.5 text-sm text-ink-700">
            {user.achievements?.length ? user.achievements.map((a) => <li key={a}>🏆 {a}</li>) : <p className="text-sm text-ink-400">No achievements added yet.</p>}
          </ul>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink-900">Resume</h2>
        {user.resumeUrl ? (
          <a href={user.resumeUrl} target="_blank" rel="noreferrer" download className="btn-secondary inline-flex"><Download size={15} /> Download Resume</a>
        ) : (
          <p className="text-sm text-ink-400">No resume uploaded yet. Add one from Edit Profile.</p>
        )}
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile" size="lg">
        <form onSubmit={save} className="space-y-4">
          <ImageUploadField value={form.avatar} onChange={(url) => setForm({ ...form, avatar: url })} folder="avatars" label="Profile Photo" shape="round" />
          <div>
            <label className="label-field">About</label>
            <textarea rows={3} className="input-field" value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Skills (comma separated)</label>
            <input className="input-field" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Achievements (comma separated)</label>
            <input className="input-field" value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} />
          </div>
          <FileUploadField value={resumeFile} onChange={setResumeFile} folder="resumes" label="Resume" accept=".pdf,.doc,.docx" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">LinkedIn</label>
              <input className="input-field" value={form.socialLinks?.linkedin || ""} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })} />
            </div>
            <div>
              <label className="label-field">GitHub</label>
              <input className="input-field" value={form.socialLinks?.github || ""} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, github: e.target.value } })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Save Changes</button>
        </form>
      </Modal>
    </div>
  );
}
