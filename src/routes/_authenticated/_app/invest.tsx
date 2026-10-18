import { createFileRoute } from "@tanstack/react-router";
import { InvestList, useMyInvestments } from "@/components/invest-list";
import { money } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/_app/invest")({
  head: () => ({ meta: [{ title: "Invest — Earn to Each Other" }, { name: "description", content: "Invest your balance in gold, silver and more for daily profit." }, { property: "og:title", content: "Invest — Earn to Each Other" }, { property: "og:description", content: "Invest your balance in gold, silver and more for daily profit." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: InvestPage,
});

function InvestPage() {
  const { data: mine } = useMyInvestments();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Invest</h1>
        <p className="text-sm text-muted-foreground">Grow your balance with daily profit.</p>
      </div>
      <InvestList />
      {!!mine?.length && (
        <div>
          <h2 className="mb-3 font-semibold">My investments</h2>
          <div className="space-y-2">
            {mine.map((i) => {
              const days = Math.min(Math.floor((Date.now() - new Date(i.started_at).getTime()) / 86400000), i.duration_days);
              const profit = (Number(i.amount) * Number(i.daily_percent) / 100) * days;
              return (
                <div key={i.id} className="flex items-center justify-between rounded-xl border bg-card p-3 text-sm">
                  <div><p className="font-semibold">{i.plan_name} · {money(i.amount)}</p><p className="text-xs text-muted-foreground">Day {days}/{i.duration_days} · {days >= i.duration_days ? "Completed" : "Running"}</p></div>
                  <span className="font-bold text-primary">+{money(profit)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
