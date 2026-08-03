import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import campusLogin from "../../assets/campus_img.jpg";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      illustrationTitle="Welcome back!"
      illustrationText="Log in to continue to your account"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label-field">Silicon Email</label>
          <div className="relative">
            <Mail
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="you@silicon.ac.in"
              className="input-field pl-9"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="label-field">Password</label>
          <div className="relative">
            <Lock
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="••••••••"
              className="input-field pl-9 pr-9"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-500">
            <input
              type="checkbox"
              className="rounded border-surface-border text-primary-500 focus:ring-primary-400"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Logging in..." : "Login"}
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-primary-600 hover:text-primary-700"
        >
          Register
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ children, illustrationTitle, illustrationText }) {
  return (
    <div className="flex h-screen items-center justify-center overflow-hidden bg-[#f7f7fa] p-4">
      {/* MAIN CARD */}
      <div className="grid h-[90vh] max-h-[720px] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl lg:grid-cols-2">
        
        {/* LEFT */}
        <div className="relative hidden bg-gradient-to-br from-[#7357f6] to-[#a777ed] px-10 py-7 lg:flex lg:flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white">
              <GraduationCap size={20} />
            </div>

            <div>
              <p className="text-sm font-bold leading-tight text-white">
                CampusConnect
              </p>
              <p className="text-[11px] text-white/70">
                All-in-one campus platform
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="flex min-h-0 flex-1 items-center justify-center py-4">
            <img
              src={campusLogin}
              alt="Campus Connect"
              className="max-h-[480px] w-full max-w-[400px] rounded-[24px] object-cover"
            />
          </div>

          {/* Bottom Text */}
          {/* <div>
            <h2 className="text-xl font-bold text-white">
              Your campus, all in one place.
            </h2>
          </div> */}
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center bg-white px-10 py-8">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-gradient text-white">
                <GraduationCap size={20} />
              </div>

              <p className="text-sm font-bold text-ink-900">CampusConnect</p>
            </div>

            <h1 className="text-2xl font-bold text-ink-900">
              {illustrationTitle}
            </h1>

            <p className="mb-6 mt-1 text-sm text-ink-500">{illustrationText}</p>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
