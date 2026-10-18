import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/common";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — Earn to Each Other" },
    { name: "description", content: "How Earn to Each Other handles your data." },
    { property: "og:title", content: "Privacy Policy — Earn to Each Other" },
    { property: "og:description", content: "How Earn to Each Other handles your data." },
  ] }),
  component: () => (
    <LegalShell title="Privacy Policy">
      <p>We collect only what we need to run your account: name, email, mobile number, country, language, profile photo, task submissions and payout details.</p>
      <h2>How we use it</h2><p>To verify tasks, credit rewards, process withdrawals and prevent fraud.</p>
      <h2>Payout details</h2><p>Bank and UPI details are visible only to you and authorised administrators, and are masked in the app.</p>
      <h2>Your rights</h2><p>Contact support to access or delete your data.</p>
    </LegalShell>
  ),
});
