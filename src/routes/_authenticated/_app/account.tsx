import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ChevronRight, CircleAlert, History, LogOut, Mail, Phone, User, Wallet } from "lucide-react";
import { Card, StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { money, useBalances, useProfile, useUser } from "@/lib/data";
import { demoSignOut, readDemoUser } from "@/lib/demo-auth";
import { clearDemoSubs } from "@/lib/demo-tasks";

export const Route = createFileRoute("/_authenticated/_app/account")({
  head: () => ({ meta: [{ title: "Account — Earn to Each Other" }, { name: "description", content: "Your account, withdrawals and verification." }, { property: "og:title", content: "Account — Earn to Each Other" }, { property: "og:description", content: "Your account, withdrawals and verification." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AccountPage,
});

function AccountPage() {
  const nav = useNavigate();
  const { data: u } = useUser();
  const { data: p } = useProfile();
  const { data: b } = useBalances();
  const { data: methods } = useQuery({
    queryKey: ["payout-methods"],
    queryFn: async () => (readDemoUser() ? [] : (await supabase.from("payout_methods").select("*").order("created_at", { ascending: false })).data ?? []),
  });
  const payoutStatus = methods?.[0]?.verification_status;
  const checks: [string, boolean, string?][] = [
    ["Email verified", !!(u && ("email_confirmed_at" in u ? u.email_confirmed_at : u.email))],
    ["Profile completed", !!p?.profile_completed],
    ["Mobile number added", !!p?.phone],
    ["Payout account", payoutStatus === "verified", payoutStatus ?? "not added"],
  ];

  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-primary-soft">
          {p?.avatar_url ? <img src={p.avatar_url} alt="" className="h-full w-full object-cover" /> : <User className="m-4 h-8 w-8 text-primary" />}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{p?.full_name}</h1>
          <p className="flex items-center gap-1 truncate text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {p?.email ?? u?.email}</p>
          {p?.phone && <p className="flex items-center gap-1 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {p.phone}</p>}
        </div>
        {p && <StatusBadge status={p.account_status} />}
      </Card>

      <div className="rounded-3xl bg-hero p-5 text-primary-foreground shadow-elegant">
        <p className="text-sm opacity-85">Available balance</p>
        <p className="font-display text-3xl font-bold">{money(b?.available)}</p>
        <p className="mt-1 text-xs opacity-80">Pending {money(b?.pending)} · Withdrawn {money(b?.withdrawn)}</p>
        <Button asChild variant="glass" size="sm" className="mt-4"><Link to="/withdraw"><Wallet /> Withdraw</Link></Button>
      </div>

      <Card className="p-0">
        {([["/withdraw", Wallet, "Withdrawal"], ["/transactions", History, "Transaction history"], ["/setup", User, "Edit account details"]] as const).map(([to, Icon, l]) => (
          <Link key={to} to={to} className="flex items-center gap-3 border-b px-5 py-4 last:border-0">
            <Icon className="h-5 w-5 text-primary" /><span className="flex-1 font-medium">{l}</span><ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Verification</h2>
        <div className="space-y-3">
          {checks.map(([l, ok, note]) => (
            <div key={l} className="flex items-center gap-3">
              {ok ? <BadgeCheck className="h-5 w-5 text-success" /> : <CircleAlert className="h-5 w-5 text-warning" />}
              <span className="flex-1 text-sm">{l}</span>
              <span className="text-xs capitalize text-muted-foreground">{ok ? "Verified" : note ?? "Pending"}</span>
            </div>
          ))}
        </div>
      </Card>

      <Button variant="outline" className="w-full" onClick={async () => { demoSignOut(); clearDemoSubs(); await supabase.auth.signOut(); nav({ to: "/auth", search: {} as never }); }}><LogOut /> Log out</Button>
    </div>
  );
}
