import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, GraduationCap, Home, ListChecks, Shield, User } from "lucide-react";
import { LangSelect, Logo } from "@/components/common";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/lib/data";
import { useT, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_app")({
  beforeLoad: async ({ context }) => {
    // Demo mode: skip the profile-completed check, the demo profile is always complete.
    if (context.userId === "demo-user") return { accountStatus: "active" };
    const { data } = await supabase.from("profiles").select("profile_completed, account_status").eq("id", context.userId).maybeSingle();
    if (!data?.profile_completed) throw redirect({ to: "/setup" });
    return { accountStatus: data.account_status };
  },
  component: AppShell,
});

const NAV: { to: "/home" | "/tasks" | "/account"; label: string; icon: typeof Home }[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/account", label: "Account", icon: User },
];

function AppShell() {
  const { t } = useT();
  const { userId, accountStatus } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: isAdmin } = useIsAdmin();

  useEffect(() => {
    if (userId === "demo-user") return;
    supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", userId).then(() => {});
  }, [userId]);

  return (
    <div className="min-h-screen bg-soft md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar p-5 md:flex">
        <Logo />
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent", path.startsWith(n.to) && "bg-sidebar-accent text-sidebar-accent-foreground")}>
              <n.icon className="h-5 w-5" /> {n.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent"><Shield className="h-5 w-5" /> {t("admin")}</Link>
          )}
        </nav>
        <div className="mt-auto"><LangSelect className="w-full" /></div>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur md:px-8">
          <div className="md:hidden"><Logo /></div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            {isAdmin && <Link to="/admin" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted md:hidden" aria-label="Admin"><Shield className="h-5 w-5" /></Link>}
            <div className="md:hidden"><LangSelect /></div>
            <Link to="/notifications" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted" aria-label={t("notifications")}><Bell className="h-5 w-5" /></Link>
          </div>
        </header>
        {accountStatus !== "active" && (
          <div className="bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">Your account is suspended. Contact support for help.</div>
        )}
        <main className="mx-auto max-w-5xl px-4 py-6 pb-safe-nav md:px-8 md:pb-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-30 mb-[env(safe-area-inset-bottom)] rounded-2xl border bg-card/95 shadow-elegant backdrop-blur md:hidden">
        <div className="grid grid-cols-3">
          {NAV.map((n) => {
            const active = path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={cn("flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-semibold transition-colors", active ? "text-primary" : "text-muted-foreground")}>
                <span className={cn("grid h-8 w-14 place-items-center rounded-full transition-colors", active && "bg-primary-soft")}><n.icon className="h-5 w-5" /></span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
