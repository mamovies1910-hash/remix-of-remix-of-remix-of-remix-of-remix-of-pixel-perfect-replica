import { createFileRoute, redirect } from "@tanstack/react-router";

// Sign-up now happens on /auth with email + password.
export const Route = createFileRoute("/phone-signup")({
  head: () => ({
    meta: [
      { title: "Sign up with mobile — Earn to Each Other" },
      { name: "description", content: "Create your Earn to Each Other account with your mobile number and a 4-digit OTP." },
      { property: "og:title", content: "Sign up with mobile — Earn to Each Other" },
      { property: "og:description", content: "Verify your mobile number with a 4-digit OTP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => { throw redirect({ to: "/auth", search: { mode: "signup" } }); },
  component: () => null,
});
