// Demo sign-in is retired: real accounts use Firebase email login.
// These helpers stay inert so older code paths fall through to the real account.
import type { PendingSignup } from "@/lib/pending-signup";

const KEY = "ut-demo-user";

export type DemoUser = { full_name: string; email: string; phone: string; avatar_url: string };

export function demoSignIn(_extra?: PendingSignup & { email?: string }) {
  demoSignOut();
  return null;
}

export function readDemoUser(): DemoUser | null {
  return null;
}

export function isDemoSignedIn() {
  return false;
}

export function demoSignOut() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
