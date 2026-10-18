import { createServerFn } from "@tanstack/react-start";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export const adminListUsers = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => {
    if (!d || typeof d.key !== "string" || d.key.length > 200) throw new Error("Invalid key");
    return d;
  })
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_KEY;
    if (!expected) return { ok: false as const, error: "Admin key not configured", users: [] };
    if (!safeEqual(data.key, expected)) return { ok: false as const, error: "Wrong admin key", users: [] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, phone, country, account_status, created_at, last_seen_at")
      .order("last_seen_at", { ascending: false, nullsFirst: false });
    if (error) return { ok: false as const, error: error.message, users: [] };
    return { ok: true as const, error: null, users: users ?? [] };
  });
