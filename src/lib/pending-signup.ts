// Details collected before the account exists (mobile, name, photo), applied on the profile setup page.
export type PendingSignup = { phone?: string; full_name?: string; avatar_url?: string };
const KEY = "ut-pending-signup";

export function savePending(p: PendingSignup) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...readPending(), ...p })); } catch { /* storage full */ }
}
export function readPending(): PendingSignup {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") as PendingSignup; } catch { return {}; }
}
export function clearPending() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
