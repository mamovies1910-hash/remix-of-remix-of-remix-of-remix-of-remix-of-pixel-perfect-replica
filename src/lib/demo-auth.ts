// Demo mode: no real account is created. Any signup/login path stores a demo
// profile locally and sends the user straight to Home. Replace with real auth
// (Supabase/Firebase) when the backend APIs are connected.
import type { PendingSignup } from "@/lib/pending-signup";

const KEY = "ut-demo-user";

export type DemoUser = {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
};

export function demoSignIn(extra?: PendingSignup & { email?: string }) {
  const prev = readDemoUser();
  const user: DemoUser = {
    full_name: extra?.full_name?.trim() || prev?.full_name || "Demo User",
    email: extra?.email?.trim() || prev?.email || "demo@gmail.com",
    phone: extra?.phone?.trim() || prev?.phone || "",
    avatar_url: extra?.avatar_url || prev?.avatar_url || "",
  };
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* storage full */ }
  return user;
}

export function readDemoUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch { return null; }
}

export function isDemoSignedIn() {
  return readDemoUser() !== null;
}

export function demoSignOut() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
