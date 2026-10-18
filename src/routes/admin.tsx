import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminListUsers } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Earn to Each Other" },
      { name: "description", content: "Admin dashboard: all registered users" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Earn to Each Other" },
      { property: "og:description", content: "Admin dashboard: all registered users" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Users = Awaited<ReturnType<typeof adminListUsers>>["users"];
const STORE = "admin_key";

function AdminPage() {
  const [key, setKey] = useState("");
  const [users, setUsers] = useState<Users | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function login(k: string) {
    setBusy(true); setErr(null);
    try {
      const r = await adminListUsers({ data: { key: k } });
      if (r.ok) { sessionStorage.setItem(STORE, k); setUsers(r.users); }
      else { sessionStorage.removeItem(STORE); setErr(r.error); }
    } catch { setErr("Something went wrong"); }
    setBusy(false);
  }

  useEffect(() => { const k = sessionStorage.getItem(STORE); if (k) login(k); }, []);

  if (!users)
    return (
      <div className="min-h-screen grid place-items-center bg-soft p-4">
        <form onSubmit={(e) => { e.preventDefault(); login(key); }} className="w-full max-w-sm rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold"><KeyRound className="text-primary" /> Admin login</div>
          <Input type="password" placeholder="Admin key" value={key} onChange={(e) => setKey(e.target.value)} autoFocus />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" className="w-full" disabled={busy || !key}>{busy ? "Checking..." : "Open admin"}</Button>
        </form>
      </div>
    );

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : "—");
  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <Button variant="outline" size="sm" onClick={() => { sessionStorage.removeItem(STORE); setUsers(null); setKey(""); }}><LogOut className="h-4 w-4" /> Logout</Button>
      </div>
      <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
        <Users className="text-primary" />
        <div><div className="text-2xl font-bold">{users.length}</div><div className="text-sm text-muted-foreground">Registered users</div></div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr><th className="p-2">Name</th><th className="p-2">Email / Phone</th><th className="p-2">Country</th><th className="p-2">Status</th><th className="p-2">Joined</th><th className="p-2">Last login</th></tr>
          </thead>
          <tbody>
            {users.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.full_name ?? "—"}</td>
                <td className="p-2">{p.email ?? p.phone ?? "—"}</td>
                <td className="p-2">{p.country ?? "—"}</td>
                <td className="p-2">{p.account_status}</td>
                <td className="p-2">{fmt(p.created_at)}</td>
                <td className="p-2">{fmt(p.last_seen_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
