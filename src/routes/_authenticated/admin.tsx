import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, Users } from "lucide-react";
import { Empty, PageTitle } from "@/components/common";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Earn to Each Other" },
      { name: "description", content: "Admin dashboard: all registered users" },
      { property: "og:title", content: "Admin — Earn to Each Other" },
      { property: "og:description", content: "Admin dashboard: all registered users" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const q = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) return { admin: false, users: [] };
      const { data: admin } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
      if (!admin) return { admin: false, users: [] };
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, country, account_status, created_at, last_seen_at")
        .order("last_seen_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return { admin: true, users: data ?? [] };
    },
  });

  if (q.isLoading) return <div className="p-4"><PageTitle title="Admin" /></div>;
  if (!q.data?.admin)
    return (
      <div className="p-4">
        <PageTitle title="Admin" />
        <Empty icon={<ShieldAlert />} title="Admins only" text="Your account does not have admin access." />
      </div>
    );

  const users = q.data.users;
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : "—");
  return (
    <div className="p-4 space-y-4">
      <PageTitle title="Admin" />
      <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
        <Users className="text-primary" />
        <div>
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-sm text-muted-foreground">Registered users</div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-2">Name</th><th className="p-2">Email / Phone</th><th className="p-2">Country</th>
              <th className="p-2">Status</th><th className="p-2">Joined</th><th className="p-2">Last login</th>
            </tr>
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
