import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import api from "../../api/axios.js";
import { AuthShell } from "./Login.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devInfo, setDevInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setSent(true);
      // Only present when SMTP isn't configured server-side — lets you test
      // the flow locally without setting up real email delivery.
      if (data.devResetToken) {
        setDevInfo({ message: data.message, link: `/reset-password/${data.devResetToken}` });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell illustrationTitle="Forgot password?" illustrationText="No worries, we'll send you reset instructions">
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-emerald-50 px-4 py-8 text-center">
          <CheckCircle2 className="text-emerald-600" size={32} />
          <p className="text-sm text-emerald-700">
            If an account exists for <span className="font-semibold">{email}</span>, a reset link is on its way.
          </p>
          {devInfo && (
            <div className="mt-2 w-full rounded-lg bg-amber-50 px-3 py-2 text-left text-xs text-amber-700">
              <p className="font-medium">Email delivery isn't configured on the server yet.</p>
              <p className="mt-1">
                For now, use this link directly:{" "}
                <Link to={devInfo.link} className="font-semibold underline">
                  Reset your password
                </Link>
              </p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-field">Silicon Email</label>
            <input type="email" required placeholder="you@silicon.ac.in" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending..." : "Send reset link"}
            <ArrowRight size={16} />
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-ink-500">
        Remembered your password?{" "}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
