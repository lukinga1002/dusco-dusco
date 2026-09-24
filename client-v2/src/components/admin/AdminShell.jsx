import React from "react";
import { Navigate, Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { getAdminToken, clearAdminToken } from "@/lib/duscoApi";

export default function AdminShell() {
  const navigate = useNavigate();
  if (!getAdminToken()) return <Navigate to="/admin" replace />;
  const links = [{ to: "/admin/dashboard", label: "Dashboard", end: true }, { to: "/admin/users", label: "Users" }, { to: "/admin/transactions", label: "Transactions" }];
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link to="/admin/dashboard" className="inline-flex min-h-11 items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display font-bold text-dusco-gold-soft">D</span><span className="font-display text-lg font-semibold">Dusco Admin</span></Link>
        <div className="flex items-center gap-1">
          <nav aria-label="Admin navigation" className="hidden gap-1 sm:flex">{links.map(({ to, label, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>{label}</NavLink>)}</nav>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground hover:bg-accent" onClick={() => { clearAdminToken(); navigate("/admin", { replace: true }); }}><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </div>
      <nav aria-label="Admin navigation" className="flex gap-1 border-t px-4 py-1.5 sm:hidden">{links.map(({ to, label, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>{label}</NavLink>)}</nav>
    </header>
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6"><Outlet /></main>
  </div>;
}