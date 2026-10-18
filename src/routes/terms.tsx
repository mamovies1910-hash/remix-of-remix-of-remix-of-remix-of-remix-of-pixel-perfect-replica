import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/common";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Terms of Service — Earn to Each Other" },
    { name: "description", content: "Rules for using Earn to Each Other." },
    { property: "og:title", content: "Terms of Service — Earn to Each Other" },
    { property: "og:description", content: "Rules for using Earn to Each Other." },
  ] }),
  component: () => (
    <LegalShell title="Terms of Service">
      <p>By using Earn to Each Other you agree to these terms.</p>
      <h2>Rewards</h2><p>Rewards are credited only after a task submission is reviewed and approved. Earnings are not guaranteed. Pending rewards cannot be withdrawn.</p>
      <h2>Fair use</h2><p>One account per person. Duplicate, fake or automated submissions are rejected and may lead to suspension.</p>
      <h2>Withdrawals</h2><p>Withdrawals require the published minimum amount, may carry a displayed fee, and are reviewed before payment.</p>
      <h2>Changes</h2><p>We may update these terms; continued use means you accept the updated terms.</p>
    </LegalShell>
  ),
});
