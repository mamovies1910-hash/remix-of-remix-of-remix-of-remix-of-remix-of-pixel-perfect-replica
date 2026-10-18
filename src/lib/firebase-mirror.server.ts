// Copies admin-managed data (sliders, videos, tasks, gift cards, settings, user balances,
// withdrawals) into Firebase Realtime Database after every admin change.
// Uses the database secret so only the server can write; skipped if not configured.
type Db = any;

const DB_URL = "https://vfgtht-6bdbd-default-rtdb.firebaseio.com";

export async function mirrorToFirebase(db: Db) {
  const secret = process.env["FIREBASE_DB_SECRET"];
  if (!secret) return;
  try {
    const [users, bal, wd, tasks, media, settings, gifts] = await Promise.all([
      db.from("profiles").select("id, full_name, email, avatar_url, account_status, created_at"),
      db.rpc("admin_user_balances"),
      db.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(1000),
      db.from("tasks").select("*"),
      db.from("media_items").select("*"),
      db.from("app_settings").select("*").eq("id", 1).maybeSingle(),
      db.from("reward_options").select("*"),
    ]);
    const byId = (rows: any[] | null) => Object.fromEntries((rows ?? []).map((r) => [r.id ?? r.user_id, r]));
    const b = new Map((bal.data ?? []).map((r: any) => [r.user_id, r]));
    const userRows = (users.data ?? []).map((u: any) => {
      const r: any = b.get(u.id);
      const earned = Number(r?.earned ?? 0) + Number(r?.adjusted ?? 0);
      return { ...u, balance: { earned, withdrawn: Number(r?.withdrawn ?? 0), available: earned - Number(r?.held ?? 0) } };
    });
    const media_ = media.data ?? [];
    const snapshot = {
      users: byId(userRows),
      withdrawals: byId(wd.data),
      tasks: byId(tasks.data),
      sliders: byId(media_.filter((m: any) => m.kind === "slide")),
      videos: byId(media_.filter((m: any) => m.kind === "video")),
      gift_cards: byId(gifts.data),
      settings: settings.data ?? {},
      updated_at: new Date().toISOString(),
    };
    await fetch(`${DB_URL}/app.json?auth=${encodeURIComponent(secret)}`, { method: "PUT", body: JSON.stringify(snapshot) });
  } catch (e) {
    console.error("Firebase mirror failed", e);
  }
}
