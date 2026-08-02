import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink-900">Settings</h1>
      <div className="card max-w-md p-6">
        <h2 className="mb-3 text-sm font-semibold text-ink-900">Admin Account</h2>
        <div className="space-y-2 text-sm text-ink-700">
          <p><span className="text-ink-500">Name:</span> {user?.fullName}</p>
          <p><span className="text-ink-500">Email:</span> {user?.email}</p>
          <p><span className="text-ink-500">Role:</span> {user?.role?.replace("_", " ")}</p>
        </div>
        <p className="mt-4 text-xs text-ink-400">Manage your personal profile from the Profile page in the student view.</p>
      </div>
    </div>
  );
}
