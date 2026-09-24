import React, { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { api, getAdminToken, setAdminToken } from "@/lib/duscoApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (getAdminToken()) return <Navigate to="/admin/dashboard" replace />;
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password) return setError("Enter your admin username and password.");
    setLoading(true);
    try {
      const result = await api.adminLogin({ username: form.username.trim(), password: form.password });
      setAdminToken(result.token || result.adminToken);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  return <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-dusco-gold-soft">D</span>
        <h1 className="mt-3 font-display text-2xl font-semibold">Dusco Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Staff area. Credentials are issued by the platform operator.</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-5">
        <label className="block text-sm font-medium">Username<input className="mt-1.5 min-h-12 w-full rounded-xl border bg-background px-3 text-sm" autoComplete="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
        <label className="block text-sm font-medium">Password<input type="password" className="mt-1.5 min-h-12 w-full rounded-xl border bg-background px-3 text-sm" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={loading} className="min-h-12 w-full rounded-xl bg-primary font-medium text-primary-foreground disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="text-center text-sm"><Link to="/" className="text-muted-foreground">Back to the Dusco app</Link></p>
    </div>
  </div>;
}