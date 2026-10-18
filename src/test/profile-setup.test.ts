import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { needsProfileSetup } from "@/lib/profile-query";

describe("One-time account setup", () => {
  it("requires setup for a newly created account", () => {
    expect(needsProfileSetup({ profile_completed: false })).toBe(true);
  });
  it("does not require setup again for a completed account", () => {
    expect(needsProfileSetup({ profile_completed: true })).toBe(false);
  });
  it("requires setup when no saved profile exists", () => {
    expect(needsProfileSetup(null)).toBe(true);
  });
});