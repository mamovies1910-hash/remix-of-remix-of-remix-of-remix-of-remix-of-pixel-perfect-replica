// A tiny "logged in on this device" hint so landing/login can jump to Home instantly,
// before the real session check finishes. Protected pages still verify the real session.
const KEY = "ete_logged_in";

export function hasLoginHint() {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
export function setLoginHint() {
  try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
}
export function clearLoginHint() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
