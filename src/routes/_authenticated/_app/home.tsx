import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Wallet } from "lucide-react";
import { useState } from "react";
import { HeroSlider } from "@/components/hero-slider";
import { TaskList } from "@/components/task-list";
import { money, useBalances, useProfile } from "@/lib/data";
import { SLIDES } from "@/lib/slides";

export const Route = createFileRoute("/_authenticated/_app/home")({
  head: () => ({ meta: [{ title: "Home — Earn to Each Other" }, { name: "description", content: "Watch, complete tasks and earn rewards." }, { property: "og:title", content: "Home — Earn to Each Other" }, { property: "og:description", content: "Watch, complete tasks and earn rewards." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: HomePage,
});

function HomePage() {
  const { data: p } = useProfile();
  const { data: b } = useBalances();
  const [slide, setSlide] = useState(0);
  return (
    <div
      className="-m-4 min-h-full space-y-6 p-4 transition-colors duration-700"
      style={{ backgroundColor: SLIDES[slide]?.pageBg }}
    >
      <HeroSlider onSlideChange={setSlide} />
      <Link to="/account" className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-card">
        <div>
          <p className="text-xs text-muted-foreground">Hi {p?.full_name?.split(" ")[0]} · Available balance</p>
          <p className="font-display text-2xl font-bold">{money(b?.available)}</p>
          <p className="text-xs text-muted-foreground">Pending {money(b?.pending)} · Earned {money(b?.total_earned)}</p>
        </div>
        <span className="flex items-center gap-1 rounded-xl bg-primary-soft px-3 py-2 text-sm font-semibold text-primary"><Wallet className="h-4 w-4" /> Withdraw</span>
      </Link>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Tasks</h2>
          <Link to="/tasks" className="flex items-center gap-1 text-sm text-primary">See all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <TaskList limit={5} />
      </div>
    </div>
  );
}
