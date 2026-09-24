import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Wallet, ArrowLeftRight, Users, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { Button } from "@/components/ui/button";
import NotificationPanel from "@/components/dusco/NotificationPanel";

const navigation = [{ to: "/app", label: "Home", icon: Home, end: true }, { to: "/app/bahashas", label: "Bahashas", icon: Wallet }, { to: "/app/groups", label: "Groups", icon: Users }, { to: "/app/transactions", label: "Activity", icon: ArrowLeftRight }];
export default function AppShell() {
  const { logout } = useDuscoAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const signOut = async () => {
    await client.cancelQueries({ queryKey: ["dusco"] });
    logout();
    client.removeQueries({ queryKey: ["dusco"] });
    navigate("/login", { replace: true });
  };
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link to="/app" className="inline-flex min-h-11 items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display font-bold text-dusco-gold-soft">D</span><span className="font-display text-lg font-semibold">Dusco</span></Link>
        <div className="flex items-center gap-1"><NotificationPanel /><Button asChild variant="ghost" size="icon" className="h-11 w-11" aria-label="Settings"><Link to="/app/settings"><SettingsIcon className="h-4 w-4" /></Link></Button><Button variant="ghost" size="icon" className="h-11 w-11" onClick={signOut} aria-label="Log out"><LogOut className="h-4 w-4" /></Button></div>
      </div>
    </header>
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8"><Outlet /></main>
    <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"><div className="mx-auto flex h-16 max-w-3xl">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}><Icon className="h-5 w-5" />{label}</NavLink>)}</div></nav>
  </div>;
}