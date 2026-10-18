import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Film, ImageIcon, KeyRound, LogOut, Plus, Settings, Target, Trash2, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  adminAddMedia, adminAdjustBalance, adminDeleteMedia, adminDeleteTask, adminFinishVideo, adminGetData, adminLogin,
  adminSaveSettings, adminSaveTask, adminSetUserStatus, adminUpdateWithdrawal, adminUploadImage, adminVideoUploadUrl,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Earn to Each Other" },
      { name: "description", content: "Admin control center for users, payouts, media and tasks" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Earn to Each Other" },
      { property: "og:description", content: "Admin control center for users, payouts, media and tasks" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Data = Awaited<ReturnType<typeof adminGetData>>;
type Task = Data["tasks"][number];
const STORE = "admin_key";
const inr = (n: number | null | undefined) => `₹${Number(n ?? 0).toFixed(2)}`;
const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : "—");
const err = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong");

function AdminPage() {
  const [key, setKey] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [bad, setBad] = useState(false);

  async function login(k: string) {
    setBusy(true); setBad(false);
    try {
      const r = await adminLogin({ data: { key: k } });
      if (r.ok) { sessionStorage.setItem(STORE, k); setKey(k); } else { sessionStorage.removeItem(STORE); setBad(true); }
    } catch { setBad(true); }
    setBusy(false);
  }
  useEffect(() => { const k = sessionStorage.getItem(STORE); if (k) login(k); }, []);

  if (!key)
    return (
      <div className="grid min-h-screen place-items-center bg-soft p-4">
        <form onSubmit={(e) => { e.preventDefault(); login(input); }} className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2 text-lg font-semibold"><KeyRound className="text-primary" /> Admin login</div>
          <Input type="password" placeholder="Admin key" value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
          {bad && <p className="text-sm text-destructive">Wrong admin key</p>}
          <Button type="submit" className="w-full" disabled={busy || !input}>{busy ? "Checking..." : "Open admin"}</Button>
        </form>
      </div>
    );
  return <Dashboard adminKey={key} onLogout={() => { sessionStorage.removeItem(STORE); setKey(null); setInput(""); }} />;
}

function Dashboard({ adminKey, onLogout }: { adminKey: string; onLogout: () => void }) {
  const [d, setD] = useState<Data | null>(null);
  const load = useCallback(async () => {
    try { setD(await adminGetData({ data: { key: adminKey } })); } catch (e) { err(e); }
  }, [adminKey]);
  useEffect(() => { load(); }, [load]);

  const pending = d?.withdrawals.filter((w) => w.status === "pending" || w.status === "processing") ?? [];
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <Button variant="outline" size="sm" onClick={onLogout}><LogOut className="h-4 w-4" /> Logout</Button>
      </div>
      {!d ? <p className="text-muted-foreground">Loading…</p> : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Users" value={String(d.users.length)} />
            <Stat label="Pending payouts" value={String(pending.length)} />
            <Stat label="Pending amount" value={inr(pending.reduce((s, w) => s + Number(w.amount), 0))} />
            <Stat label="Total paid" value={inr(d.withdrawals.filter((w) => w.status === "paid").reduce((s, w) => s + Number(w.amount), 0))} />
          </div>
          <Tabs defaultValue="users">
            <TabsList className="flex h-auto flex-wrap">
              <TabsTrigger value="users"><Users className="mr-1 h-4 w-4" />Users</TabsTrigger>
              <TabsTrigger value="payouts"><Wallet className="mr-1 h-4 w-4" />Withdrawals</TabsTrigger>
              <TabsTrigger value="media"><ImageIcon className="mr-1 h-4 w-4" />Sliders & Videos</TabsTrigger>
              <TabsTrigger value="tasks"><Target className="mr-1 h-4 w-4" />Ads & Tasks</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="mr-1 h-4 w-4" />Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="users"><UsersTab d={d} k={adminKey} reload={load} /></TabsContent>
            <TabsContent value="payouts"><PayoutsTab d={d} k={adminKey} reload={load} /></TabsContent>
            <TabsContent value="media"><MediaTab d={d} k={adminKey} reload={load} /></TabsContent>
            <TabsContent value="tasks"><TasksTab d={d} k={adminKey} reload={load} /></TabsContent>
            <TabsContent value="settings"><SettingsTab d={d} k={adminKey} reload={load} /></TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

type TabProps = { d: Data; k: string; reload: () => Promise<void> };

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-card p-4"><div className="text-2xl font-bold">{value}</div><div className="text-sm text-muted-foreground">{label}</div></div>;
}

function UsersTab({ d, k, reload }: TabProps) {
  const [q, setQ] = useState("");
  const list = d.users.filter((u) => `${u.full_name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase()));
  async function adjust(userId: string) {
    const v = window.prompt("Amount to add (use minus to deduct), e.g. 50 or -20");
    if (!v) return;
    const amount = Number(v);
    if (!Number.isFinite(amount) || amount === 0) return toast.error("Enter a valid amount");
    const note = window.prompt("Reason (optional)") ?? undefined;
    try { await adminAdjustBalance({ data: { key: k, userId, amount, note } }); toast.success("Balance updated"); reload(); } catch (e) { err(e); }
  }
  async function toggle(userId: string, status: string) {
    try { await adminSetUserStatus({ data: { key: k, userId, status: status === "blocked" ? "active" : "blocked" } }); reload(); } catch (e) { err(e); }
  }
  return (
    <div className="space-y-3">
      <Input placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left"><tr>
            <th className="p-2">User</th><th className="p-2">Available</th><th className="p-2">Earned</th><th className="p-2">Withdrawn</th>
            <th className="p-2">Joined</th><th className="p-2">Last login</th><th className="p-2">Status</th><th className="p-2"></th>
          </tr></thead>
          <tbody>{list.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2"><div className="font-medium">{u.full_name ?? "—"}</div><div className="text-xs text-muted-foreground">{u.email ?? u.phone ?? "—"}</div></td>
              <td className="p-2 font-semibold">{inr(u.available)}</td><td className="p-2">{inr(u.earned)}</td><td className="p-2">{inr(u.withdrawn)}</td>
              <td className="p-2">{fmt(u.created_at)}</td><td className="p-2">{fmt(u.last_seen_at)}</td>
              <td className="p-2"><span className={u.account_status === "blocked" ? "text-destructive" : "text-success"}>{u.account_status}</span></td>
              <td className="space-x-1 whitespace-nowrap p-2">
                <Button size="sm" variant="outline" onClick={() => adjust(u.id)}>± Balance</Button>
                <Button size="sm" variant={u.account_status === "blocked" ? "default" : "destructive"} onClick={() => toggle(u.id, u.account_status)}>{u.account_status === "blocked" ? "Unblock" : "Block"}</Button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {!list.length && <p className="p-4 text-center text-muted-foreground">No users</p>}
      </div>
    </div>
  );
}

function PayoutsTab({ d, k, reload }: TabProps) {
  const [filter, setFilter] = useState<"open" | "all">("open");
  const users = new Map(d.users.map((u) => [u.id, u]));
  const methods = new Map(d.payoutMethods.map((m) => [m.id, m]));
  const list = d.withdrawals.filter((w) => filter === "all" || w.status === "pending" || w.status === "processing");
  async function set(id: string, status: "paid" | "rejected" | "processing") {
    let reference: string | undefined;
    if (status === "paid") { reference = window.prompt("UTR / transaction ID") ?? undefined; if (!reference) return; }
    if (status === "rejected") { reference = window.prompt("Reason for rejecting (amount goes back to the user)") ?? undefined; if (reference === undefined) return; }
    try { await adminUpdateWithdrawal({ data: { key: k, id, status, reference } }); toast.success("Updated"); reload(); } catch (e) { err(e); }
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button size="sm" variant={filter === "open" ? "default" : "outline"} onClick={() => setFilter("open")}>Pending</Button>
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>History</Button>
      </div>
      {!list.length && <p className="rounded-xl border bg-card p-6 text-center text-muted-foreground">No withdrawals here</p>}
      {list.map((w) => {
        const u = users.get(w.user_id); const m = w.payout_method_id ? methods.get(w.payout_method_id) : undefined;
        return (
          <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div>
              <div className="text-lg font-bold">{inr(w.amount)} <span className="text-xs font-normal text-muted-foreground">fee {inr(w.fee)}</span></div>
              <div className="text-sm">{u?.full_name ?? "—"} · {u?.email ?? u?.phone ?? ""}</div>
              <div className="text-sm text-muted-foreground">
                {m ? (m.method_type === "upi" ? `UPI: ${m.upi_id}` : `Bank: ${m.bank_name} · A/C ${m.account_number} · IFSC ${m.ifsc}`) : "No payout account"} {m && `· ${m.holder_name}`}
              </div>
              <div className="text-xs text-muted-foreground">{fmt(w.created_at)} · <b>{w.status}</b>{w.provider_reference ? ` · ${w.provider_reference}` : ""}</div>
            </div>
            {(w.status === "pending" || w.status === "processing") && (
              <div className="flex gap-2">
                {w.status === "pending" && <Button size="sm" variant="outline" onClick={() => set(w.id, "processing")}>Processing</Button>}
                <Button size="sm" onClick={() => set(w.id, "paid")}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => set(w.id, "rejected")}>Reject</Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function readBase64(f: File) {
  return new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); });
}

function MediaTab({ d, k, reload }: TabProps) {
  const [busy, setBusy] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const slides = d.media.filter((m) => m.kind === "slide");
  const videos = d.media.filter((m) => m.kind === "video");

  async function uploadSlide(f: File | undefined) {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error("Image must be under 10 MB");
    setBusy(true);
    try {
      const { url } = await adminUploadImage({ data: { key: k, base64: await readBase64(f) } });
      await adminAddMedia({ data: { key: k, kind: "slide", url, title: f.name, sort_order: slides.length } });
      toast.success("Slide added"); await reload();
    } catch (e) { err(e); }
    setBusy(false);
  }
  async function uploadVideo(f: File | undefined) {
    if (!f) return;
    if (f.size > 100 * 1024 * 1024) return toast.error("Video must be under 100 MB");
    setBusy(true);
    try {
      const s = await adminVideoUploadUrl({ data: { key: k, filename: f.name } });
      const up = await supabase.storage.from("media").uploadToSignedUrl(s.path, s.token, f, { contentType: f.type });
      if (up.error) throw new Error(up.error.message);
      await adminFinishVideo({ data: { key: k, path: s.path, title: f.name, sort_order: videos.length } });
      toast.success("Video added"); await reload();
    } catch (e) { err(e); }
    setBusy(false);
  }
  async function addVideoUrl() {
    try { await adminAddMedia({ data: { key: k, kind: "video", url: videoUrl, title: null, sort_order: videos.length } }); setVideoUrl(""); reload(); } catch (e) { err(e); }
  }
  async function remove(id: string) {
    if (!window.confirm("Remove this item?")) return;
    try { await adminDeleteMedia({ data: { key: k, id } }); reload(); } catch (e) { err(e); }
  }
  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Home page sliders</h2>
          <label className="cursor-pointer"><input type="file" accept="image/*" hidden disabled={busy} onChange={(e) => { uploadSlide(e.target.files?.[0]); e.target.value = ""; }} />
            <span className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"><Plus className="h-4 w-4" />{busy ? "Uploading…" : "Upload image"}</span></label>
        </div>
        <p className="text-xs text-muted-foreground">When you add images here they replace the built-in slides. Remove all to go back to the built-in ones.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {slides.map((m) => (
            <div key={m.id} className="relative overflow-hidden rounded-lg border">
              <img src={m.url} alt={m.title ?? "Slide"} className="aspect-video w-full object-cover" />
              <Button size="icon" variant="destructive" className="absolute right-2 top-2 h-8 w-8" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-1 font-semibold"><Film className="h-4 w-4" />Dashboard videos</h2>
          <label className="cursor-pointer"><input type="file" accept="video/*" hidden disabled={busy} onChange={(e) => { uploadVideo(e.target.files?.[0]); e.target.value = ""; }} />
            <span className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"><Plus className="h-4 w-4" />{busy ? "Uploading…" : "Upload video"}</span></label>
        </div>
        <div className="flex gap-2"><Input placeholder="…or paste a direct .mp4 link" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} /><Button onClick={addVideoUrl} disabled={!videoUrl}>Add</Button></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {videos.map((m) => (
            <div key={m.id} className="relative overflow-hidden rounded-lg border">
              <video src={m.url} controls preload="metadata" className="aspect-[9/16] w-full bg-muted object-cover" />
              <Button size="icon" variant="destructive" className="absolute right-2 top-2 h-8 w-8" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const TYPES: { v: Task["action_type"]; label: string }[] = [
  { v: "watch", label: "Watch video ad" }, { v: "claim", label: "Daily claim / check-in" }, { v: "visit", label: "Visit website" },
  { v: "social", label: "Social follow (Telegram/YouTube)" }, { v: "install", label: "App install" },
];
const blank = (n: number) => ({ title: "", description: "", reward_amount: 5, is_active: true, action_type: "watch", action_url: "", duration_seconds: 15, button_label: "", sort_order: n });

function TasksTab({ d, k, reload }: TabProps) {
  const [edit, setEdit] = useState<ReturnType<typeof blank> & { id?: string } | null>(null);
  async function save() {
    if (!edit) return;
    try {
      await adminSaveTask({ data: { key: k, task: { ...edit, action_type: edit.action_type as "watch", description: edit.description || null, action_url: edit.action_url || null, button_label: edit.button_label || null } } });
      toast.success("Task saved"); setEdit(null); reload();
    } catch (e) { err(e); }
  }
  async function quick(t: Task, is_active: boolean) {
    try { await adminSaveTask({ data: { key: k, task: { id: t.id, title: t.title, description: t.description, reward_amount: Number(t.reward_amount), is_active, action_type: t.action_type as "watch", action_url: t.action_url, duration_seconds: t.duration_seconds, button_label: t.button_label, sort_order: t.sort_order } } }); reload(); } catch (e) { err(e); }
  }
  return (
    <div className="space-y-3">
      <Button onClick={() => setEdit(blank(d.tasks.length))}><Plus className="h-4 w-4" /> New task</Button>
      {edit && (
        <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2">
          <Field label="Title"><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
          <Field label="Type"><select className="h-10 w-full rounded-md border bg-background px-2" value={edit.action_type} onChange={(e) => setEdit({ ...edit, action_type: e.target.value })}>{TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}</select></Field>
          <Field label="Reward (₹)"><Input type="number" value={edit.reward_amount} onChange={(e) => setEdit({ ...edit, reward_amount: Number(e.target.value) })} /></Field>
          <Field label="Timer (seconds before Claim unlocks)"><Input type="number" value={edit.duration_seconds} onChange={(e) => setEdit({ ...edit, duration_seconds: Number(e.target.value) })} /></Field>
          <Field label="Link to open (website / Telegram / app store)"><Input value={edit.action_url} onChange={(e) => setEdit({ ...edit, action_url: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Start button text"><Input value={edit.button_label} onChange={(e) => setEdit({ ...edit, button_label: e.target.value })} placeholder="Start ad" /></Field>
          <Field label="Order (lower shows first)"><Input type="number" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} /></Field>
          <Field label="Active"><Switch checked={edit.is_active} onCheckedChange={(v) => setEdit({ ...edit, is_active: v })} /></Field>
          <div className="md:col-span-2"><Field label="Description"><Textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field></div>
          <div className="flex gap-2 md:col-span-2"><Button onClick={save} disabled={!edit.title}>Save</Button><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button></div>
        </div>
      )}
      {d.tasks.map((t) => (
        <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
          <div>
            <div className="font-semibold">{t.title} <span className="text-primary">{inr(t.reward_amount)}</span></div>
            <div className="text-xs text-muted-foreground">{TYPES.find((x) => x.v === t.action_type)?.label ?? t.action_type} · {t.duration_seconds}s{t.action_url ? ` · ${t.action_url}` : ""}</div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={t.is_active} onCheckedChange={(v) => quick(t, v)} />
            <Button size="sm" variant="outline" onClick={() => setEdit({ id: t.id, title: t.title, description: t.description ?? "", reward_amount: Number(t.reward_amount), is_active: t.is_active, action_type: t.action_type, action_url: t.action_url ?? "", duration_seconds: t.duration_seconds, button_label: t.button_label ?? "", sort_order: t.sort_order })}>Edit</Button>
            <Button size="icon" variant="destructive" className="h-8 w-8" onClick={async () => { if (window.confirm("Hide this task?")) { try { await adminDeleteTask({ data: { key: k, id: t.id } }); reload(); } catch (e) { err(e); } } }}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="text-sm font-medium">{label}</span>{children}</label>;
}

function SettingsTab({ d, k, reload }: TabProps) {
  const s = d.settings;
  const [f, setF] = useState({ min_withdrawal: Number(s?.min_withdrawal ?? 100), fee_percent: Number(s?.fee_percent ?? 0), fee_flat: Number(s?.fee_flat ?? 0), announcement: s?.announcement ?? "" });
  async function save() {
    try { await adminSaveSettings({ data: { key: k, ...f, announcement: f.announcement || null } }); toast.success("Settings saved"); reload(); } catch (e) { err(e); }
  }
  return (
    <div className="grid max-w-xl gap-3 rounded-xl border bg-card p-4">
      <Field label="Minimum withdrawal (₹)"><Input type="number" value={f.min_withdrawal} onChange={(e) => setF({ ...f, min_withdrawal: Number(e.target.value) })} /></Field>
      <Field label="Withdrawal fee (%)"><Input type="number" value={f.fee_percent} onChange={(e) => setF({ ...f, fee_percent: Number(e.target.value) })} /></Field>
      <Field label="Withdrawal fee flat (₹)"><Input type="number" value={f.fee_flat} onChange={(e) => setF({ ...f, fee_flat: Number(e.target.value) })} /></Field>
      <Field label="Notice board (shown on home page)"><Textarea value={f.announcement} onChange={(e) => setF({ ...f, announcement: e.target.value })} placeholder="e.g. Withdrawals are processed within 24 hours" /></Field>
      <Button onClick={save}>Save settings</Button>
    </div>
  );
}
