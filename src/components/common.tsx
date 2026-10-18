import appIcon from "@/assets/app-icon.png";
import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import type { ReactNode } from "react";
import { LANGS, useT, type Lang } from "@/lib/i18n";
import { STATUS_TONE } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 font-display font-bold text-lg", light ? "text-primary-foreground" : "text-foreground")}>
      <img src={appIcon} alt="" width={36} height={36} className="h-9 w-9 rounded-xl" />
      Earn to Each Other
    </Link>
  );
}

export function LangSelect({ className }: { className?: string }) {
  const { lang, setLang } = useT();
  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      className={cn("h-9 rounded-lg border border-input bg-card px-2 text-sm text-foreground", className)}
    >
      {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
    </select>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_TONE[status] ?? "bg-muted text-muted-foreground")}>
      {status.replace("_", " ")}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border bg-card p-5 shadow-card", className)}>{children}</div>;
}

export function Empty({ icon, title, text }: { icon: ReactNode; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</div>
      <p className="font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function LegalShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-soft">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5"><Logo /><LangSelect /></header>
      <main className="mx-auto max-w-3xl px-5 pb-16">
        <h1 className="mb-6 text-3xl font-bold">{title}</h1>
        <div className="space-y-4 rounded-2xl border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-card [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground">{children}</div>
      </main>
    </div>
  );
}
