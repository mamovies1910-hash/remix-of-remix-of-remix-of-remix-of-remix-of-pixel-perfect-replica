import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { createClient } from "@supabase/supabase-js";
import { firebaseConfig } from "./firebase-config";
import { verifiedFirebaseIdentity } from "./identity";

export const exchangeFirebaseIdentity = createServerFn({ method: "POST" }).handler(async () => {
  const header = getRequestHeader("X-Firebase-Token");
  if (!header) throw new Error("Sign in to continue.");
  const keys = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
  const { payload } = await jwtVerify(header, keys, {
    issuer: `https://securetoken.google.com/${firebaseConfig.projectId}`,
    audience: firebaseConfig.projectId,
    algorithms: ["RS256"],
  });
  const identity = verifiedFirebaseIdentity(payload);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const existing = await supabaseAdmin.from("firebase_identity_links").select("user_id").eq("firebase_uid", identity.uid).maybeSingle();
  if (existing.error) throw new Error("Unable to open your account.");
  let userId = existing.data?.user_id;
  // A dedicated internal account avoids linking unrelated accounts by email.
  const internalEmail = `firebase-${Array.from(new TextEncoder().encode(identity.uid), b => b.toString(16).padStart(2, "0")).join("")}@identity.earntoeachother.invalid`;
  if (!userId) {
    const created = await supabaseAdmin.auth.admin.createUser({ email: internalEmail, email_confirm: true, user_metadata: { full_name: typeof payload["name"] === "string" ? payload["name"] : "" } });
    if (created.error || !created.data.user) throw new Error("Unable to create your account. Please retry.");
    userId = created.data.user.id;
    const saved = await supabaseAdmin.from("firebase_identity_links").insert({ firebase_uid: identity.uid, user_id: userId });
    if (saved.error) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      const winner = await supabaseAdmin.from("firebase_identity_links").select("user_id").eq("firebase_uid", identity.uid).maybeSingle();
      if (!winner.data) throw new Error("Unable to create your account. Please retry.");
      userId = winner.data.user_id;
    }
  }
  const profile = await supabaseAdmin.from("profiles").upsert({ id: userId, email: identity.email }, { onConflict: "id" });
  if (profile.error) throw new Error("Unable to save your account.");
  const link = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email: internalEmail });
  if (link.error || !link.data.properties.hashed_token) throw new Error("Unable to sign in. Please retry.");
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Account service is unavailable.");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  } } });
  const verified = await client.auth.verifyOtp({ type: "magiclink", token_hash: link.data.properties.hashed_token });
  if (verified.error || !verified.data.session) throw new Error("Unable to sign in. Please retry.");
  return { access_token: verified.data.session.access_token, refresh_token: verified.data.session.refresh_token };
});