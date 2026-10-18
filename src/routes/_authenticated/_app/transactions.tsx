import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { Empty, PageTitle } from "@/components/common";

export const Route = createFileRoute("/_authenticated/_app/transactions")({
  head: () => ({ meta: [{ title: "Transaction History — Earn to Each Other" }, { name: "description", content: "Transaction History" }, { property: "og:title", content: "Transaction History — Earn to Each Other" }, { property: "og:description", content: "Transaction History" }] }),
  component: () => (
    <div className="p-4">
      <PageTitle title="Transaction History" />
      <Empty icon={<Construction />} title="Coming soon" text="This page is not finished yet." />
    </div>
  ),
});
