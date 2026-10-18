// Copies admin-managed data (sliders, videos, tasks, gift cards, settings, user balances,
// withdrawals) into Firebase Realtime Database after every admin change.
// Uses the database secret so only the server can write; skipped if not configured.
type Db = any;

const DB_URL = "https://vfgtht-6bdbd-default-rtdb.firebaseio.com";

export async function mirrorToFirebase(db: Db) {
  const sa = process.env["FIREBASE_SERVICE_ACCOUNT"];
  if (!sa) return;
  try {
    const token = await getAccessToken(JSON.parse(sa));
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
    await fetch(`${DB_URL}/app.json?access_token=${encodeURIComponent(token)}`, { method: "PUT", body: JSON.stringify(snapshot) });
  } catch (e) {
    console.error("Firebase mirror failed", e);
  }
}

const b64url = (buf: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof buf === "string" ? new TextEncoder().encode(buf) : new Uint8Array(buf as ArrayBuffer);
  let bin = ""; for (const x of bytes) bin += String.fromCharCode(x);
  return btoa(bin).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
};

// Service-account login (RS256 JWT -> Google OAuth token), Worker-safe via WebCrypto.
export async function getAccessToken(sa: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
  }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${claim}.${b64url(sig)}` }),
  });
  const j = (await res.json()) as { access_token?: string };
  if (!j.access_token) throw new Error("Firebase login failed");
  return j.access_token;
}
