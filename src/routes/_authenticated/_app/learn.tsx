import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { Empty, PageTitle } from "@/components/common";

export const Route = createFileRoute("/_authenticated/_app/learn")({
  head: () => ({ meta: [{ title: "Earn / Learn — Earn to Each Other" }, { name: "description", content: "Earn / Learn" }, { property: "og:title", content: "Earn / Learn — Earn to Each Other" }, { property: "og:description", content: "Earn / Learn" }] }),
  component: () => (
    <div className="p-4">
      <PageTitle title="Earn / Learn" />
      <Empty icon={<Construction />} title="Coming soon" text="This page is not finished yet." />
    </div>
  ),
});
