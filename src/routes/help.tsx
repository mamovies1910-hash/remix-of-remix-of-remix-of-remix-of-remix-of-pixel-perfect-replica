import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/common";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ: [string, string][] = [
  ["How do I find tasks?", "Open the Tasks tab. Each card shows the reward, time needed and instructions."],
  ["How are rewards calculated?", "Each task has a fixed reward shown on its card. You receive it once your submission is approved."],
  ["How does verification work?", "Our team reviews every submission. Approved rewards move to your Available Balance; rejected ones show a reason."],
  ["What is the minimum withdrawal?", "The minimum, fee and processing time are shown on the Withdrawal page."],
  ["Which payout methods are supported?", "UPI and bank transfer for Indian users."],
  ["How do I contact support?", "Email support@untotogether.app."],
];

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [
    { title: "Help Center — Earn to Each Other" },
    { name: "description", content: "Answers about tasks, rewards and withdrawals." },
    { property: "og:title", content: "Help Center — Earn to Each Other" },
    { property: "og:description", content: "Answers about tasks, rewards and withdrawals." },
  ] }),
  component: () => (
    <LegalShell title="Help Center">
      <Accordion type="single" collapsible>
        {FAQ.map(([q, a]) => (
          <AccordionItem key={q} value={q}><AccordionTrigger className="text-foreground">{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>
        ))}
      </Accordion>
    </LegalShell>
  ),
});
