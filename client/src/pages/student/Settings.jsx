import { useState } from "react";
import { User, Shield, Lock, Bell, Palette, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "password", label: "Password", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "delete", label: "Delete Account", icon: Trash2 },
];

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [active, setActive] = useState("profile");
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || "", department: user?.department || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [prefs, setPrefs] = useState(user?.notificationPrefs || {});
  const [message, setMessage] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/users/me", profileForm);
    updateUser(data.user);
    setMessage("Profile updated");
  };

  const savePassword = async (e) => {
    e.preventDefault();
    await api.put("/users/me/password", passwordForm);
    setPasswordForm({ currentPassword: "", newPassword: "" });
    setMessage("Password updated");
  };

  const saveNotifications = async () => {
    const { data } = await api.put("/users/me", { notificationPrefs: prefs });
    updateUser(data.user);
    setMessage("Notification preferences saved");
  };

  const deleteAccount = async () => {
    if (!confirm("This will permanently delete your account. Continue?")) return;
    await api.delete("/users/me");
    logout();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink-900">Settings</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="card p-2 lg:col-span-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${
                active === id ? "bg-primary-50 text-primary-700" : "text-ink-500 hover:bg-surface"
              } ${id === "delete" ? "text-rose-500 hover:bg-rose-50" : ""}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <div className="card p-6 lg:col-span-3">
          {message && <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          {active === "profile" && (
            <form onSubmit={saveProfile} className="space-y-4 max-w-md">
              <h2 className="text-sm font-semibold text-ink-900">Profile Information</h2>
              <div>
                <label className="label-field">Full Name</label>
                <input className="input-field" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label-field">Department</label>
                <input className="input-field" value={profileForm.department} onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          )}

          {active === "security" && (
            <div className="max-w-md space-y-3">
              <h2 className="text-sm font-semibold text-ink-900">Account Security</h2>
              <p className="text-sm text-ink-500">Email: {user?.email}</p>
              <p className="text-sm text-ink-500">Student ID: {user?.studentId}</p>
              <p className="text-sm text-ink-500">Role: {user?.role?.replace("_", " ")}</p>
            </div>
          )}

          {active === "password" && (
            <form onSubmit={savePassword} className="space-y-4 max-w-md">
              <h2 className="text-sm font-semibold text-ink-900">Change Password</h2>
              <div>
                <label className="label-field">Current Password</label>
                <input type="password" required className="input-field" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div>
                <label className="label-field">New Password</label>
                <input type="password" required minLength={8} className="input-field" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary">Update Password</button>
            </form>
          )}

          {active === "notifications" && (
            <div className="max-w-md space-y-4">
              <h2 className="text-sm font-semibold text-ink-900">Notification Preferences</h2>
              {[
                ["eventUpdates", "Event Updates"],
                ["jobUpdates", "Job Updates"],
                ["marketplaceMessages", "Marketplace Messages"],
                ["announcements", "General Announcements"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-xl border border-surface-border px-4 py-3">
                  <span className="text-sm text-ink-700">{label}</span>
                  <input type="checkbox" checked={!!prefs[key]} onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })} className="h-4 w-4 rounded text-primary-500 focus:ring-primary-400" />
                </label>
              ))}
              <button onClick={saveNotifications} className="btn-primary">Save Preferences</button>
            </div>
          )}

          {active === "appearance" && (
            <div className="max-w-md space-y-3">
              <h2 className="text-sm font-semibold text-ink-900">Appearance</h2>
              <p className="text-sm text-ink-500">Use the moon/sun icon in the top navbar to toggle dark mode.</p>
            </div>
          )}

          {active === "delete" && (
            <div className="max-w-md space-y-4">
              <h2 className="text-sm font-semibold text-rose-600">Delete Account</h2>
              <p className="text-sm text-ink-500">This action is permanent and will remove all your data from CampusConnect.</p>
              <button onClick={deleteAccount} className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600">
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
