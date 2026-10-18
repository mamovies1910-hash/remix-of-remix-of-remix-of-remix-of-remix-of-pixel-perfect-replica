export function verifiedFirebaseIdentity(payload: { sub?: string; email?: unknown; email_verified?: unknown }) {
  if (!payload.sub || payload.sub.length > 128 || typeof payload.email !== "string" || payload.email_verified !== true) {
    throw new Error("Verify your email before continuing.");
  }
  return { uid: payload.sub, email: payload.email };
}