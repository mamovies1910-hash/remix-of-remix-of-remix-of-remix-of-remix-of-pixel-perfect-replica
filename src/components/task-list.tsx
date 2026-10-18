import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Clock, Eye, PlayCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Empty } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { errMsg, money, useMySubmissions, useTasks } from "@/lib/data";
import { readDemoUser } from "@/lib/demo-auth";
import { completeDemoTask } from "@/lib/demo-tasks";
import { cn } from "@/lib/utils";

const AD_SECONDS = 15;
type Task = NonNullable<ReturnType<typeof useTasks>["data"]>[number];

// Banner styles rotate per task — each card gets its own color banner.
const BANNERS = [
  { bg: "linear-gradient(135deg, oklch(0.45 0.11 163), oklch(0.62 0.12 150))", deco: "oklch(0.98 0.01 150 / 18%)" },
  { bg: "linear-gradient(135deg, oklch(0.55 0.14 240), oklch(0.7 0.12 230))", deco: "oklch(0.98 0.01 240 / 20%)" },
  { bg: "linear-gradient(135deg, oklch(0.62 0.15 70), oklch(0.78 0.13 80))", deco: "oklch(0.98 0.02 80 / 25%)" },
  { bg: "linear-gradient(135deg, oklch(0.5 0.13 300), oklch(0.65 0.12 290))", deco: "oklch(0.98 0.01 300 / 20%)" },
  { bg: "linear-gradient(135deg, oklch(0.55 0.16 30), oklch(0.7 0.14 40))", deco: "oklch(0.98 0.01 40 / 22%)" },
];

function Banner({ index, title, reward }: { index: number; title: string; reward: number }) {
  const b = BANNERS[index % BANNERS.length] ?? BANNERS[0]!;
  return (
    <div className="relative h-24 overflow-hidden" style={{ background: b.bg }}>
      {/* decorative shapes */}
      <span className="absolute -left-6 -top-8 h-24 w-24 rounded-full" style={{ background: b.deco }} />
      <span className="absolute -bottom-10 right-8 h-28 w-28 rounded-full" style={{ background: b.deco }} />
      <span className="absolute right-24 top-3 h-8 w-8 rotate-45 rounded-lg" style={{ background: b.deco }} />
      <span className="absolute left-1/3 bottom-2 h-4 w-4 rounded-full" style={{ background: b.deco }} />
      <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2">
        <p className="line-clamp-1 font-display text-lg font-bold text-white drop-shadow-sm">{title}</p>
        <span className="shrink-0 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-foreground shadow-sm">+{money(reward)}</span>
      </div>
    </div>
  );
}

// Cooldown rule: the 2 lowest-paying ads repeat after 1 hour,
// the next one after 2.5 hours, the highest-paying ones after 3 hours.
export function cooldownMinutes(rank: number) {
  if (rank < 2) return 60;
  if (rank === 2) return 150;
  return 180;
}

function fmtLeft(ms: number) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  return now;
}

export function TaskList({ limit }: { limit?: number }) {
  const { data: tasks, isLoading } = useTasks();
  const { data: subs } = useMySubmissions();
  const [open, setOpen] = useState<Task | null>(null);
  const now = useNow();
  const stats = new Map<string, { earned: number; last: number }>();
  for (const s of subs ?? []) {
    const amt = Number("reward_amount" in s ? s.reward_amount : (s.tasks?.reward_amount ?? 0));
    const at = new Date(s.submitted_at as string).getTime();
    const cur = stats.get(s.task_id) ?? { earned: 0, last: 0 };
    stats.set(s.task_id, { earned: cur.earned + amt, last: Math.max(cur.last, at) });
  }
  const rankOf = new Map([...(tasks ?? [])].sort((a, b) => a.reward_amount - b.reward_amount).map((t, i) => [t.id, i]));
  const list = limit ? tasks?.slice(0, limit) : tasks;

  if (isLoading) return <div className="space-y-3">{[0, 1, 2].map((k) => <Skeleton key={k} className="h-40 rounded-2xl" />)}</div>;
  if (!list?.length) return <Empty icon={<PlayCircle />} title="No tasks right now" text="Check back soon." />;

  return (
    <>
      <div className="space-y-4">
        {list.map((t, i) => {
          const st = stats.get(t.id);
          const cd = cooldownMinutes(rankOf.get(t.id) ?? 0);
          const readyAt = st ? st.last + cd * 60_000 : 0;
          const isDone = !!st && now < readyAt;
          const earned = st?.earned ?? 0;
          return (
            <div key={t.id} className={cn("overflow-hidden rounded-2xl border bg-card shadow-card", isDone && "border-success/40")}>
              <Banner index={i} title={t.title} reward={t.reward_amount} />
              <div className="space-y-3 p-4">
                <p className="line-clamp-2 text-sm text-muted-foreground">{t.description || "Watch the full ad to earn this reward."}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {AD_SECONDS}s ad</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Repeats every {cd % 60 ? `${(cd / 60).toFixed(1)}h` : `${cd / 60}h`}</span>
                </div>
                {isDone ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-sm font-semibold text-success">
                      <BadgeCheck className="h-5 w-5" /> Completed · You earned {money(earned)}
                    </div>
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
                      <Clock className="h-4 w-4" /> Available again in <span className="font-mono font-bold text-foreground">{fmtLeft(readyAt - now)}</span>
                    </div>
                  </div>
                ) : (
                  <Button variant="hero" className="w-full" onClick={() => setOpen(t)}>
                    <PlayCircle /> Start Task · Earn {money(t.reward_amount)}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {open && <AdPlayer task={open} onClose={() => setOpen(null)} />}
    </>
  );
}

// A random theme is picked each time an ad opens (sky blue or cream).
const AD_THEMES = [
  { bg: "linear-gradient(170deg, oklch(0.93 0.05 230), oklch(0.85 0.08 230))", card: "linear-gradient(135deg, oklch(0.6 0.13 235), oklch(0.72 0.11 225))", btn: "oklch(0.58 0.15 240)", fg: "oklch(0.28 0.06 245)" },
  { bg: "linear-gradient(170deg, oklch(0.97 0.03 90), oklch(0.91 0.06 80))", card: "linear-gradient(135deg, oklch(0.72 0.13 70), oklch(0.82 0.1 85))", btn: "oklch(0.55 0.12 60)", fg: "oklch(0.3 0.04 60)" },
];

// Party-popper sound: two quick "pop" bursts.
function playPops() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const pop = (t: number) => {
      const len = Math.floor(ctx.sampleRate * 0.12);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
      const n = ctx.createBufferSource(); n.buffer = buf;
      const ng = ctx.createGain(); ng.gain.value = 0.9;
      n.connect(ng).connect(ctx.destination); n.start(t);
      const o = ctx.createOscillator(); const og = ctx.createGain();
      o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.15);
      og.gain.setValueAtTime(0.8, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(og).connect(ctx.destination); o.start(t); o.stop(t + 0.2);
    };
    pop(ctx.currentTime); pop(ctx.currentTime + 0.28);
    setTimeout(() => ctx.close(), 1500);
  } catch { /* sound not supported */ }
}

// Confetti bursts from both sides of the Claim button, then falls down.
function Celebration() {
  const colors = ["#FFD54A", "#FF6B6B", "#4ADE80", "#60A5FA", "#F472B6", "#A78BFA"];
  const bits = Array.from({ length: 56 }, (_, i) => {
    const left = i % 2 === 0;
    const dx = (left ? 1 : -1) * (40 + ((i * 53) % 220));
    const up = 380 + ((i * 97) % 320);
    return { left, dx, up, c: colors[i % colors.length], d: (i % 7) * 0.03, shape: i % 3 };
  });
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style>{`
        @keyframes pop-burst {
          0% { transform: translate(0,0) rotate(0); opacity: 1 }
          35% { transform: translate(var(--dx), calc(var(--up) * -1)) rotate(360deg); opacity: 1 }
          100% { transform: translate(calc(var(--dx) * 1.4), 40px) rotate(900deg); opacity: 0 }
        }
        @keyframes popper { 0%,100% { transform: scale(1) } 20% { transform: scale(1.35) rotate(-10deg) } }
      `}</style>
      {[true, false].map((l) => (
        <span key={String(l)} className="absolute bottom-6 text-4xl" style={{ [l ? "left" : "right"]: 8, animation: "popper .5s ease-out 2", transform: l ? undefined : "scaleX(-1)" }}>🎉</span>
      ))}
      {bits.map((b, i) => (
        <span key={i} className="absolute bottom-10" style={{
          [b.left ? "left" : "right"]: 28, ["--dx" as string]: `${b.dx}px`, ["--up" as string]: `${b.up}px`,
          width: b.shape === 0 ? 8 : 10, height: b.shape === 0 ? 14 : 10, background: b.c,
          borderRadius: b.shape === 1 ? 999 : 2, animation: `pop-burst 2.6s ${b.d + (i % 4 === 0 ? 0.28 : 0)}s cubic-bezier(.2,.7,.4,1) forwards`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

// Pencil-style doodles (dog, flowers, trees, sun, clouds) for the ad background.
function Doodles({ color }: { color: string }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.22">
      {/* sun */}
      <circle cx="340" cy="70" r="22" /><path d="M340 34v-12M340 118v-12M304 70h-12M388 70h-12M315 45l-8-8M373 103l-8-8M365 45l8-8M307 103l8-8" />
      {/* clouds */}
      <path d="M40 120c0-14 12-24 26-22 6-12 26-14 34 0 14-2 22 10 18 22z" />
      <path d="M210 200c0-10 9-17 19-15 5-9 19-10 25 0 10-1 16 7 13 15z" />
      {/* tree */}
      <path d="M60 470v-70M60 430l-14-12M60 420l14-14" /><path d="M60 400c-30 0-38-30-20-44-6-22 22-34 34-18 18-8 34 12 24 28 14 16 0 36-18 34-6 4-14 4-20 0z" />
      {/* tree 2 */}
      <path d="M350 560v-60" /><path d="M350 440l-30 50h60zM350 470l-34 50h68z" />
      {/* flowers */}
      <g><path d="M120 720v-50" /><circle cx="120" cy="660" r="6" /><path d="M120 654c-6-14 6-20 0-20s6 6 0 20M126 660c14-6 20 6 20 0s-6 6-20 0M120 666c6 14-6 20 0 20s-6-6 0-20M114 660c-14 6-20-6-20 0s6-6 20 0" /><path d="M120 700c10-10 22-8 22-8-2 10-14 12-22 8z" /></g>
      <g><path d="M300 740v-40" /><circle cx="300" cy="692" r="5" /><path d="M300 687c-5-11 5-16 0-16s5 5 0 16M305 692c11-5 16 5 16 0s-5 5-16 0M300 697c5 11-5 16 0 16s-5-5 0-16M295 692c-11 5-16-5-16 0s5-5 16 0" /></g>
      <g><path d="M40 300v-30" /><circle cx="40" cy="264" r="4" /><path d="M36 262c-8-8 0-14 4-8 4-6 12 0 4 8M44 268c8 8 0 14-4 8-4 6-12 0-4-8" /></g>
      {/* dog */}
      <g transform="translate(210 600)">
        <path d="M0 40c0-20 14-30 40-30h40c10 0 16 8 16 16v14" />
        <path d="M8 40v30M30 40v30M74 40v30M92 40v30" />
        <path d="M96 26c4-18 18-26 32-20 10 4 12 18 4 26-6 6-20 6-28 2" />
        <path d="M114 6c-4-10 2-16 8-14 4 2 2 10-2 14" /><circle cx="122" cy="16" r="1.5" /><path d="M136 22l4 2" />
        <path d="M0 30c-10-6-16-14-14-22" />
      </g>
      {/* little bird */}
      <path d="M150 90c6-6 12-6 16 0 4-6 10-6 16 0" /><path d="M250 130c5-5 10-5 13 0 3-5 8-5 13 0" />
    </svg>
  );
}

function AdPlayer({ task, onClose }: { task: Task; onClose: () => void }) {
  const qc = useQueryClient();
  const [left, setLeft] = useState(AD_SECONDS);
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [theme] = useState(() => AD_THEMES[Math.floor(Math.random() * AD_THEMES.length)]!);
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  async function claim() {
    setBusy(true);
    if (readDemoUser()) {
      completeDemoTask(task.id, task.reward_amount);
    } else {
      const { error } = await supabase.rpc("submit_task", { _task_id: task.id, _evidence: `Ad watched fully (${AD_SECONDS}s) at ${new Date().toISOString()}` });
      if (error) { setBusy(false); toast.error(errMsg(error)); return; }
      toast.success(`${money(task.reward_amount)} added to pending — credited after review`);
    }
    setCelebrate(true);
    playPops();
    setTimeout(() => {
      setBusy(false);
      qc.invalidateQueries({ queryKey: ["my-subs"] });
      qc.invalidateQueries({ queryKey: ["balances"] });
      onClose();
    }, 2800);
  }

  const pct = ((AD_SECONDS - left) / AD_SECONDS) * 100;
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: theme.bg, color: theme.fg }}>
      <Doodles color={theme.fg} />
      {celebrate && <Celebration />}
      <div className="flex items-center justify-between gap-3 p-4 relative">
        <div>
          <p className="text-xs opacity-70">You will earn</p>
          <p className="font-display text-2xl font-bold">{money(task.reward_amount)}</p>
        </div>
        <div className="rounded-full bg-white/50 px-3 py-1 text-sm font-semibold">{left > 0 ? `Ad · ${left}s` : "Done"}</div>
        <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/50"><X className="h-5 w-5" /></button>
      </div>
      <div className="h-1 bg-white/25"><div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, background: theme.btn }} /></div>
      <div className="grid flex-1 place-items-center p-6 relative">
        {/* Simulated ad — replace with a real ad network later */}
        <div className="w-full max-w-md overflow-hidden rounded-3xl p-8 text-center text-white shadow-2xl" style={{ background: theme.card }}>
          <p className="text-xs uppercase tracking-widest opacity-70">Sponsored</p>
          <h3 className="mt-3 animate-rise font-display text-3xl font-extrabold">{task.title}</h3>
          <p className="mt-2 text-sm opacity-90">{task.description || "Thanks for watching!"}</p>
        </div>
      </div>
      <div className="relative p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button className="w-full border-0 text-white hover:opacity-90" style={{ background: theme.btn }} size="lg" disabled={left > 0 || busy} onClick={claim}>
          {left > 0 ? `Wait ${left}s to claim` : busy ? "Claiming…" : `Claim ${money(task.reward_amount)}`}
        </Button>
        {left > 0 && <p className="mt-2 text-center text-xs opacity-60">Closing now will not give the reward.</p>}
      </div>
    </div>
  );
}
