import { createFileRoute, redirect } from "@tanstack/react-router";

// Sign-up now happens on /auth with email + password.
export const Route = createFileRoute("/create-account")({
  head: () => ({
    meta: [
      { title: "Create your account — Earn to Each Other" },
      { name: "description", content: "Add your photo, name and verify your Gmail to finish creating your account." },
      { property: "og:title", content: "Create your account — Earn to Each Other" },
      { property: "og:description", content: "Add your photo, name and verify your Gmail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => { throw redirect({ to: "/auth", search: { mode: "signup" } }); },
  component: () => null,
});
