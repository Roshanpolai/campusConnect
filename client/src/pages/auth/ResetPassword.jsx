import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import api from "../../api/axios.js";
import { AuthShell } from "./Login.jsx";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell illustrationTitle="Reset password" illustrationText="Choose a new password for your account">
      {done ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-emerald-50 px-4 py-8 text-center">
          <CheckCircle2 className="text-emerald-600" size={32} />
          <p className="text-sm text-emerald-700">Password reset! Redirecting you to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-field">New Password</label>
            <input type="password" required minLength={8} placeholder="Create new password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Confirm Password</label>
            <input type="password" required placeholder="Confirm new password" className="input-field" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Resetting..." : "Reset password"}
            <ArrowRight size={16} />
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-ink-500">
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
