import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/common";
import { TaskList } from "@/components/task-list";
import { money, useBalances } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Earn to Each Other" }, { name: "description", content: "Watch ads and complete tasks to earn." }, { property: "og:title", content: "Tasks — Earn to Each Other" }, { property: "og:description", content: "Watch ads and complete tasks to earn." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: TasksPage,
});

function TasksPage() {
  const { data: b } = useBalances();
  return (
    <div className="space-y-5">
      <PageTitle title="Tasks" sub="Tap a task, watch the full ad, claim your reward." />
      <div className="grid grid-cols-3 gap-3 text-center">
        {([["Available", b?.available], ["Pending", b?.pending], ["Total earned", b?.total_earned]] as const).map(([l, v]) => (
          <div key={l} className="rounded-2xl border bg-card p-3 shadow-card"><p className="font-display text-lg font-bold">{money(v)}</p><p className="text-xs text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <TaskList />
    </div>
  );
}
