import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/data";
import { planImage } from "@/lib/invest-images";
import { dailyRupeesAtMax } from "@/lib/invest-math";

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
  const perDay = dailyRupeesAtMax(Number(p.daily_percent), Number(p.max_amount));
  return (
    <Link to="/invest/$planId" params={{ planId: p.id }} className="group block overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="relative h-44 overflow-hidden">
        <img src={planImage(p)} alt={p.name} loading="lazy" width={1280} height={720} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold text-primary"><TrendingUp className="h-3.5 w-3.5" />{money(perDay)}/day</span>
        <div className="absolute bottom-3 left-4 right-4 text-background">
          <p className="font-display text-xl font-bold">{p.name}</p>
          <p className="line-clamp-1 text-xs opacity-90">{p.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between p-4">
        <div className="text-xs text-muted-foreground">
          <p>Invest up to <span className="font-semibold text-foreground">{money(p.max_amount)}</span></p>
          <p>Earn {money(perDay)} daily · {money(perDay * 30)} monthly</p>
        </div>
        <span className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Invest <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  );
}

export function InvestList({ limit }: { limit?: number }) {
  const { data, isLoading } = usePlans();
  if (isLoading) return <div className="grid gap-3 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>;
  const list = (data ?? []).slice(0, limit ?? undefined);
  if (!list.length) return <p className="text-sm text-muted-foreground">No invest plans right now.</p>;
  return <div className="grid gap-4 md:grid-cols-2">{list.map((p) => <PlanCard key={p.id} p={p} />)}</div>;
}
