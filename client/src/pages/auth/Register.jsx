import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { AuthShell } from "./Login.jsx";
import { DEPARTMENTS, YEARS, SECTIONS } from "../../utils/constants.js";

const EMAIL_PATTERN = /^[a-z]{2,10}\.[a-z0-9]{4,20}@silicon\.ac\.in$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    department: "",
    year: "",
    section: "",
    password: "",
    confirmPassword: "",
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Email is derived, not typed: branchcode.sicid@silicon.ac.in
  const branchCode = DEPARTMENTS.find((d) => d.label === form.department)?.code || "";
  const sicId = form.studentId.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const computedEmail = branchCode && sicId ? `${branchCode}.${sicId}@silicon.ac.in` : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!EMAIL_PATTERN.test(computedEmail)) {
      setError("Select your department and enter your Student ID (SIC ID) to generate a valid @silicon.ac.in email");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agree) {
      setError("Please agree to the Terms & Conditions");
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, email: computedEmail });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell illustrationTitle="Create your account" illustrationText="Join the Silicon community today">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Full Name</label>
          <input name="fullName" required placeholder="Enter your full name" className="input-field" value={form.fullName} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Department</label>
            <select name="department" required className="input-field" value={form.department} onChange={handleChange}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.label} value={d.label}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Year</label>
            <select name="year" required className="input-field" value={form.year} onChange={handleChange}>
              <option value="">Select year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Section</label>
            <select name="section" required className="input-field" value={form.section} onChange={handleChange}>
              <option value="">Select section</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Student ID (SIC ID)</label>
            <input name="studentId" required placeholder="e.g. 23BECF33" className="input-field" value={form.studentId} onChange={handleChange} />
          </div>
        </div>

        <div>
          <label className="label-field">Silicon Email</label>
          <input
            readOnly
            className="input-field bg-surface text-ink-500"
            placeholder="Select department + enter Student ID to generate"
            value={computedEmail}
          />
          <p className="mt-1 text-xs text-ink-400">Auto-generated as branchcode.sicid@silicon.ac.in</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Password</label>
            <input type="password" name="password" required minLength={8} placeholder="Create password" className="input-field" value={form.password} onChange={handleChange} />
          </div>
          <div>
            <label className="label-field">Confirm Password</label>
            <input type="password" name="confirmPassword" required placeholder="Confirm password" className="input-field" value={form.confirmPassword} onChange={handleChange} />
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-500">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 rounded border-surface-border text-primary-500 focus:ring-primary-400" />
          I agree to the Terms & Conditions
        </label>

        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Register"}
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
