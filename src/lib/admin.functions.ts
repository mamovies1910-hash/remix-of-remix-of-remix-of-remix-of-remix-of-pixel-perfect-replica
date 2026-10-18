import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const keyed = <T extends z.ZodRawShape>(shape: T) => z.object({ key: z.string().min(1).max(200), ...shape });

// Verifies the admin key and returns the privileged client. Throws on a wrong key.
async function admin(key: string) {
  const expected = process.env["ADMIN_KEY"];
  if (!expected || !safeEqual(key, expected)) throw new Error("Wrong admin key");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({}).parse(d))
  .handler(async ({ data }) => {
    try { await admin(data.key); return { ok: true }; } catch { return { ok: false }; }
  });

export const adminGetData = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({}).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const [users, bal, wd, pm, tasks, media, settings] = await Promise.all([
      db.from("profiles").select("id, full_name, email, phone, country, account_status, created_at, last_seen_at").order("created_at", { ascending: false }),
      db.rpc("admin_user_balances"),
      db.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(500),
      db.from("payout_methods").select("*"),
      db.from("tasks").select("*").order("sort_order").order("created_at"),
      db.from("media_items").select("*").order("kind").order("sort_order"),
      db.from("app_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    const gifts = await db.from("reward_options").select("*").order("sort_order").order("amount");
    const b = new Map((bal.data ?? []).map((r) => [r.user_id, r]));
    return {
      users: (users.data ?? []).map((u) => {
        const r = b.get(u.id);
        const earned = Number(r?.earned ?? 0) + Number(r?.adjusted ?? 0);
        return { ...u, earned, withdrawn: Number(r?.withdrawn ?? 0), available: earned - Number(r?.held ?? 0) };
      }),
      withdrawals: wd.data ?? [],
      payoutMethods: pm.data ?? [],
      tasks: tasks.data ?? [],
      media: media.data ?? [],
      settings: settings.data,
      gifts: gifts.data ?? [],
    };
  });

export const adminAdjustBalance = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ userId: z.string().uuid(), amount: z.number().refine((n) => n !== 0 && Math.abs(n) <= 1_000_000), note: z.string().max(200).optional() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const { error } = await db.from("balance_adjustments").insert({ user_id: data.userId, amount: data.amount, note: data.note ?? null });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetUserStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ userId: z.string().uuid(), status: z.enum(["active", "blocked"]) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const { error } = await db.from("profiles").update({ account_status: data.status }).eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Rejecting frees the held amount, so it returns to the user's available balance.
export const adminUpdateWithdrawal = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ id: z.string().uuid(), status: z.enum(["pending", "processing", "paid", "rejected"]), reference: z.string().max(200).optional() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const { error } = await db.from("withdrawals").update({ status: data.status, provider_reference: data.reference ?? null }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const taskShape = {
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(500).nullable(),
  reward_amount: z.number().min(0).max(100000),
  is_active: z.boolean(),
  action_type: z.enum(["watch", "claim", "visit", "social", "install"]),
  action_url: z.string().max(500).nullable(),
  duration_seconds: z.number().int().min(0).max(600),
  button_label: z.string().max(40).nullable(),
  sort_order: z.number().int().min(0).max(10000),
};

export const adminSaveTask = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ task: z.object(taskShape) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const { id, ...t } = data.task;
    const { error } = id ? await db.from("tasks").update(t).eq("id", id) : await db.from("tasks").insert(t);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteTask = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    // Hide instead of delete so past earnings stay intact.
    const { error } = await db.from("tasks").update({ is_active: false }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ min_withdrawal: z.number().min(0).max(1_000_000), fee_percent: z.number().min(0).max(100), fee_flat: z.number().min(0).max(100000), announcement: z.string().max(500).nullable() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const { key: _k, ...s } = data;
    const { error } = await db.from("app_settings").upsert({ id: 1, ...s, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAddMedia = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ kind: z.enum(["slide", "video"]), url: z.string().url().max(1000), title: z.string().max(120).nullable(), sort_order: z.number().int().min(0).max(1000) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const { key: _k, ...m } = data;
    const { error } = await db.from("media_items").insert(m);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteMedia = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const { error } = await db.from("media_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Images go to imgBB.
export const adminUploadImage = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ base64: z.string().min(10).max(15_000_000) }).parse(d))
  .handler(async ({ data }) => {
    await admin(data.key);
    const apiKey = process.env["IMGBB_API_KEY"];
    if (!apiKey) throw new Error("Image upload is not configured");
    const body = new FormData();
    body.append("image", data.base64.replace(/^data:[^,]+,/, ""));
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body });
    const json = (await res.json()) as { data?: { url?: string } };
    if (!res.ok || !json.data?.url) throw new Error("Image upload failed");
    return { url: json.data.url };
  });

// Videos are too big for imgBB: the browser uploads straight to storage using a one-time URL.
export const adminVideoUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ filename: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const ext = data.filename.split(".").pop()?.replace(/[^a-z0-9]/gi, "").slice(0, 5) || "mp4";
    const path = `videos/${crypto.randomUUID()}.${ext}`;
    const { data: s, error } = await db.storage.from("media").createSignedUploadUrl(path);
    if (error || !s) throw new Error(error?.message ?? "Could not start upload");
    return { path, token: s.token };
  });

// After upload, create a long-lived viewing link and save it as a dashboard video.
export const adminFinishVideo = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ path: z.string().regex(/^videos\/[a-f0-9-]+\.[a-z0-9]+$/i), title: z.string().max(120).nullable(), sort_order: z.number().int().min(0).max(1000) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const { data: s, error } = await db.storage.from("media").createSignedUrl(data.path, 60 * 60 * 24 * 365 * 10);
    if (error || !s) throw new Error(error?.message ?? "Could not save video");
    const ins = await db.from("media_items").insert({ kind: "video", url: s.signedUrl, title: data.title, sort_order: data.sort_order });
    if (ins.error) throw new Error(ins.error.message);
    return { ok: true };
  });

export const adminSaveGift = createServerFn({ method: "POST" })
  .inputValidator((d) => keyed({ gift: z.object({
    id: z.string().uuid().optional(),
    brand: z.enum(["google_play", "amazon"]),
    title: z.string().min(1).max(80),
    amount: z.number().positive().max(1_000_000),
    is_active: z.boolean(),
    daily_limit_per_user: z.number().int().min(1).max(100).nullable(),
    sort_order: z.number().int().min(0).max(10000),
  }) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.key);
    const { id, ...g } = data.gift;
    const { error } = id ? await db.from("reward_options").update(g).eq("id", id) : await db.from("reward_options").insert(g);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
