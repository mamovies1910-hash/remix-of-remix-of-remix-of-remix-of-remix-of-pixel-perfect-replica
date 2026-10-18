import { describe, expect, it } from "vitest";
import { verifiedFirebaseIdentity } from "@/lib/identity";
describe("Verified account identity", () => {
  it("accepts a verified account with its immutable owner", () => {
    expect(verifiedFirebaseIdentity({ sub: "owner-1", email: "user@example.com", email_verified: true })).toEqual({ uid: "owner-1", email: "user@example.com" });
  });
  it("rejects an unverified email", () => {
    expect(() => verifiedFirebaseIdentity({ sub: "owner-1", email: "user@example.com", email_verified: false })).toThrow();
  });
  it("rejects a missing owner", () => {
    expect(() => verifiedFirebaseIdentity({ email: "user@example.com", email_verified: true })).toThrow();
  });
});