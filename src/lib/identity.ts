export function verifiedFirebaseIdentity(payload: { sub?: string; email?: unknown; email_verified?: unknown }) {
  if (!payload.sub || payload.sub.length > 128 || typeof payload.email !== "string") {
    throw new Error("Invalid account.");
  }
  return { uid: payload.sub, email: payload.email };
}