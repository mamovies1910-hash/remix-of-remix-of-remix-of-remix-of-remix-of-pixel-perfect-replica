import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { usePlans } from "@/components/invest-list";
import { errMsg, money, useBalances } from "@/lib/data";
import { planImage } from "@/lib/invest-images";
import { dailyProfit, monthlyProfit } from "@/lib/invest-math";

export const Route = createFileRoute("/_authenticated/_app/invest_/$planId")({
  head: () => ({ meta: [{ title: "Invest plan — Earn to Each Other" }, { name: "description", content: "Choose your amount and see your daily and monthly profit." }, { property: "og:title", content: "Invest plan — Earn to Each Other" }, { property: "og:description", content: "Choose your amount and see your daily and monthly profit." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PlanPage,
});

function PlanPage() {
  const { planId } = Route.useParams();
  const { data: plans, isLoading } = usePlans();
  const { data: b } = useBalances();
  const qc = useQueryClient();
  const nav = useNavigate();
  const p = plans?.find((x) => x.id === planId);
  const min = Number(p?.min_amount ?? 0);
  const max = Number(p?.max_amount ?? 0);
  const [amt, setAmt] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (p) setAmt(Number(p.max_amount)); }, [p]);

  if (isLoading) return <Skeleton className="h-96" />;
  if (!p) return <div className="space-y-3"><p>This plan is not available.</p><Link to="/invest" className="text-primary">Back to invest</Link></div>;

  const pct = Number(p.daily_percent);
  const day = dailyProfit(amt, pct);
  const valid = amt >= min && amt <= max && amt > 0;

  async function invest() {
    if (!valid || !p) return;
    setBusy(true);
    const { error } = await supabase.rpc("invest_now", { _plan_id: p.id, _amount: amt });
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success(`Invested ${money(amt)} in ${p.name}`);
    qc.invalidateQueries();
    nav({ to: "/invest" });
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link to="/invest" className="flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" /> All plans</Link>
      <div className="relative h-56 overflow-hidden rounded-3xl">
        <img src={planImage(p)} alt={p.name} width={1280} height={720} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 text-background">
          <h1 className="font-display text-3xl font-bold">{p.name}</h1>
          <p className="text-sm opacity-90">{p.description}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Investment amount</span>
          <span className="text-muted-foreground">Balance {money(b?.available)}</span>
        </div>
        <Input type="number" value={amt || ""} min={min} max={max} onChange={(e) => setAmt(Math.max(0, Math.min(max, Number(e.target.value) || 0)))} className="h-12 text-lg font-bold" />
        <Slider value={[amt]} min={0} max={max} step={Math.max(1, Math.round(max / 100))} onValueChange={(v) => setAmt(v[0] ?? 0)} />
        <div className="flex justify-between text-xs text-muted-foreground"><span>{money(0)}</span><span>Max {money(max)}</span></div>
        {amt > 0 && amt < min && <p className="text-xs text-destructive">Minimum is {money(min)}</p>}

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-primary-soft p-3"><p className="text-xs text-muted-foreground">Per day</p><p className="font-bold text-primary">{money(day)}</p></div>
          <div className="rounded-xl bg-primary-soft p-3"><p className="text-xs text-muted-foreground">Per month</p><p className="font-bold text-primary">{money(monthlyProfit(amt, pct))}</p></div>
          <div className="rounded-xl bg-primary-soft p-3"><p className="text-xs text-muted-foreground">{p.duration_days} days total</p><p className="font-bold text-primary">{money(day * p.duration_days)}</p></div>
        </div>
        <p className="text-xs text-muted-foreground">Your amount returns at the end of {p.duration_days} days.</p>
        <Button className="w-full" size="lg" onClick={invest} disabled={busy || !valid}>{busy ? "Investing…" : `Invest ${money(amt)}`}</Button>
      </div>
    </div>
  );
}
