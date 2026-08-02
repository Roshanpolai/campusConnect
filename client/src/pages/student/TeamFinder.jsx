import { useEffect, useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { SkeletonGrid } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Modal from "../../components/ui/Modal.jsx";

export default function TeamFinder() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", projectType: "", requiredSkills: "", maxMembers: 5 });

  const load = () => {
    setLoading(true);
    api.get("/teams", { params: { search } }).then(({ data }) => setTeams(data.teams || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const joinTeam = async (id) => {
    const { data } = await api.put(`/teams/${id}/join`);
    setTeams((prev) => prev.map((t) => (t._id === id ? data.team : t)));
  };

  const createTeam = async (e) => {
    e.preventDefault();
    await api.post("/teams", { ...form, requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean) });
    setShowModal(false);
    setForm({ name: "", projectType: "", requiredSkills: "", maxMembers: 5 });
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Team Finder</h1>
          <p className="text-sm text-ink-500">Find collaborators or build your own project team.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teams..." className="input-field pl-9 w-full sm:w-56" />
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary shrink-0"><Plus size={16} /> Create Team</button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : teams.length === 0 ? (
        <EmptyState icon={Users} title="No teams yet" description="Start one and find your collaborators." action={<button onClick={() => setShowModal(true)} className="btn-primary">Create a team</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const isMember = team.members?.some((m) => m._id === user?._id);
            const isFull = team.members?.length >= team.maxMembers;
            return (
              <div key={team._id} className="card p-5">
                <p className="font-semibold text-ink-900">{team.name}</p>
                <p className="text-xs text-ink-500">{team.projectType}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {team.requiredSkills?.map((s) => (
                    <span key={s} className="badge bg-primary-50 text-primary-700">{s}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center -space-x-2">
                  {team.members?.slice(0, 5).map((m) => (
                    <img key={m._id} src={m.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.fullName)}`} className="h-7 w-7 rounded-full border-2 border-white" alt={m.fullName} />
                  ))}
                  <span className="pl-3 text-xs text-ink-500">{team.members?.length || 0}/{team.maxMembers} members</span>
                </div>
                <button onClick={() => joinTeam(team._id)} disabled={isMember || isFull} className={isMember ? "btn-secondary w-full mt-4" : "btn-primary w-full mt-4"}>
                  {isMember ? "Joined ✓" : isFull ? "Team Full" : "Join Team"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create a team">
        <form onSubmit={createTeam} className="space-y-4">
          <div>
            <label className="label-field">Team Name</label>
            <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Project Type</label>
            <input required placeholder="e.g. Hackathon, Course Project" className="input-field" value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Required Skills</label>
            <input placeholder="Comma separated, e.g. React, Figma" className="input-field" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Max Members</label>
            <input type="number" min={2} max={12} className="input-field" value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: Number(e.target.value) })} />
          </div>
          <button type="submit" className="btn-primary w-full">Create Team</button>
        </form>
      </Modal>
    </div>
  );
}
