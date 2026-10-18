import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { Empty, PageTitle } from "@/components/common";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Earn to Each Other" }, { name: "description", content: "Admin" }, { property: "og:title", content: "Admin — Earn to Each Other" }, { property: "og:description", content: "Admin" }] }),
  component: () => (
    <div className="p-4">
      <PageTitle title="Admin" />
      <Empty icon={<Construction />} title="Coming soon" text="This page is not finished yet." />
    </div>
  ),
});
