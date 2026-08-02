import { useEffect, useState } from "react";
import { Search, Ban, CheckCircle, Trash2 } from "lucide-react";
import api from "../../api/axios.js";
import Badge from "../../components/ui/Badge.jsx";
import { SkeletonRow } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

const ROLES = ["student", "job_poster", "event_coordinator", "moderator", "super_admin"];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/users", { params: { search, role } }).then(({ data }) => setUsers(data.users || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role]);

  const setUserRole = async (id, newRole) => {
    const { data } = await api.put(`/users/${id}/role`, { role: newRole });
    setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
  };

  const toggleStatus = async (u) => {
    const status = u.status === "active" ? "blocked" : "active";
    const { data } = await api.put(`/users/${u._id}/status`, { status });
    setUsers((prev) => prev.map((x) => (x._id === u._id ? data.user : x)));
  };

  const removeUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    await api.delete(`/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Users Management</h1>
          <p className="text-sm text-ink-500">Manage roles, access, and account status.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9 w-full sm:w-56" />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field w-auto text-sm">
            <option value="all">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>
              ))}
            {!loading && users.length === 0 && (
              <tr><td colSpan={5}><EmptyState title="No users found" description="Try a different search or filter." /></td></tr>
            )}
            {!loading && users.map((u) => (
              <tr key={u._id} className="border-b border-surface-border last:border-0 hover:bg-surface/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName)}`} className="h-8 w-8 rounded-full" alt={u.fullName} />
                    <div>
                      <p className="font-medium text-ink-900">{u.fullName}</p>
                      <p className="text-xs text-ink-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-700">{u.department}</td>
                <td className="px-4 py-3">
                  <select value={u.role} onChange={(e) => setUserRole(u._id, e.target.value)} className="input-field !py-1.5 text-xs w-auto">
                    {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3"><Badge variant={u.status === "active" ? "active" : "blocked"}>{u.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => toggleStatus(u)} className="btn-ghost !p-2" title={u.status === "active" ? "Block user" : "Unblock user"}>
                      {u.status === "active" ? <Ban size={16} className="text-rose-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
                    </button>
                    <button onClick={() => removeUser(u._id)} className="btn-ghost !p-2" title="Delete user">
                      <Trash2 size={16} className="text-rose-500" />
                    </button>
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
