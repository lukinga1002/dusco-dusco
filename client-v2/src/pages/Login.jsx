import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthShell from "@/components/dusco/AuthShell";
import { useColdStartMessage } from "@/components/dusco/ColdStartLoader";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { isValidTzPhone } from "@/lib/duscoFormat";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useDuscoAuth();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const slow = useColdStartMessage();

  const from = location.state?.from || "/app";

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = {};
    if (!isValidTzPhone(form.phone)) errs.phone = "Use a Tanzanian number, e.g. 0712345678";
    if (!form.password) errs.password = "Enter your password";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await login(form.phone.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your envelopes."
      footer={<>New to Dusco? <Link to="/register" className="text-dusco-red font-medium">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dusco-ink mb-1.5">Phone number</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="auth-input"
            placeholder="0712345678"
            inputMode="tel"
            autoComplete="tel"
          />
          {errors.phone && <p className="text-xs text-dusco-red mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-dusco-ink mb-1.5">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="auth-input"
            placeholder="Your password"
            autoComplete="current-password"
          />
          {errors.password && <p className="text-xs text-dusco-red mt-1">{errors.password}</p>}
        </div>

        {serverError && <p className="text-sm text-dusco-red bg-dusco-red-soft rounded-xl px-3 py-2.5">{serverError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-dusco-red text-white font-medium hover:bg-dusco-red-dark disabled:opacity-60 transition-colors"
        >
          {loading ? (slow ? "Waking up secure servers…" : "Logging in…") : "Log in"}
        </button>
      </form>
      <style>{`
        .auth-input{width:100%;padding:0.875rem 1rem;border-radius:0.875rem;border:1px solid hsl(var(--border));background:hsl(var(--card));font-size:1rem;color:hsl(var(--foreground));outline:none;transition:border-color .15s,box-shadow .15s}
        .auth-input:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary) / .12)}
      `}</style>
    </AuthShell>
  );
}