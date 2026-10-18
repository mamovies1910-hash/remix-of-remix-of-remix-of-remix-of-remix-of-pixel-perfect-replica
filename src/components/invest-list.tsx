import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { errMsg, money } from "@/lib/data";

export function usePlans() {
  return useQuery({
    queryKey: ["invest-plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invest_plans").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useMyInvestments() {
  return useQuery({
    queryKey: ["my-investments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("investments").select("*").order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

type Plan = NonNullable<ReturnType<typeof usePlans>["data"]>[number];

function PlanCard({ p }: { p: Plan }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amt, setAmt] = useState(String(p.min_amount));
  const [busy, setBusy] = useState(false);
  const daily = (Number(amt) || 0) * Number(p.daily_percent) / 100;
  async function invest() {
    setBusy(true);
    const { error } = await supabase.rpc("invest_now", { _plan_id: p.id, _amount: Number(amt) });
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success(`Invested ${money(Number(amt))} in ${p.name}`);
    setOpen(false);
    qc.invalidateQueries();
  }
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-2xl">{p.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{p.name}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{p.description}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary"><TrendingUp className="h-3.5 w-3.5" />{Number(p.daily_percent)}%/day</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Min {money(p.min_amount)} · {p.duration_days} days · amount returns at the end</p>
      {open ? (
        <div className="mt-3 space-y-2">
          <Input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} min={Number(p.min_amount)} max={Number(p.max_amount)} />
          <p className="text-xs text-muted-foreground">Daily profit {money(daily)} · Total profit {money(daily * p.duration_days)}</p>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={invest} disabled={busy || !Number(amt)}>{busy ? "Investing…" : "Confirm invest"}</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button className="mt-3 w-full" onClick={() => setOpen(true)}>Invest now</Button>
      )}
    </div>
  );
}

export function InvestList({ limit }: { limit?: number }) {
  const { data, isLoading } = usePlans();
  if (isLoading) return <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>;
  const list = (data ?? []).slice(0, limit ?? undefined);
  if (!list.length) return <p className="text-sm text-muted-foreground">No invest plans right now.</p>;
  return <div className="grid gap-3 md:grid-cols-2">{list.map((p) => <PlanCard key={p.id} p={p} />)}</div>;
}
