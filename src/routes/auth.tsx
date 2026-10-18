import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LangSelect, Logo } from "@/components/common";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { authError, firebaseLogin, firebaseResetPassword, firebaseSignUp } from "@/lib/firebase-auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ mode: s["mode"] === "signup" ? ("signup" as const) : ("login" as const) }),
  head: () => ({
    meta: [
      { title: "Log in or sign up — Earn to Each Other" },
      { name: "description", content: "Access your Earn to Each Other account." },
      { property: "og:title", content: "Log in — Earn to Each Other" },
      { property: "og:description", content: "Access your Earn to Each Other account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const { t } = useT();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav({ to: "/home" }); });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await firebaseSignUp(email.trim(), password);
        setSent(true);
      } else {
        const r = await firebaseLogin(email.trim(), password);
        if (!r.verified) {
          toast.error("Please verify your email first. We sent the link again — check inbox and spam.");
          return;
        }
        toast.success("Logged in");
        nav({ to: "/home" });
      }
    } catch (err) {
      toast.error(authError(err));
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    if (!email.trim()) { toast.error("Enter your email first"); return; }
    try { await firebaseResetPassword(email.trim()); toast.success("Password reset link sent to your email"); }
    catch (err) { toast.error(authError(err)); }
  }

  return (
    <div className="min-h-screen bg-soft">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 py-5"><Logo /><LangSelect /></header>
      <main className="mx-auto max-w-md px-5 pb-16">
        <div className="rounded-3xl border bg-card p-6 shadow-card">
          <h1 className="text-2xl font-bold">{mode === "signup" ? "Create your account" : t("login")}</h1>
          {sent ? (
            <p className="mt-4 rounded-xl bg-primary-soft p-4 text-sm text-primary">We sent a verification link to your email. Open it, then come back and log in. Check spam if you don&apos;t see it.</p>
          ) : (
            <>
              <form onSubmit={submit} className="mt-5 space-y-4">
                <div className="space-y-1.5"><Label htmlFor="email">{t("email")}</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Sign up" : t("login")}</Button>
                {mode === "login" && <button type="button" onClick={forgot} className="w-full text-center text-sm font-semibold text-primary">Forgot password?</button>}
              </form>
            </>
          )}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>{t("haveAccount")} <Link to="/auth" search={{ mode: "login" }} className="font-semibold text-primary">{t("login")}</Link></>
            ) : (
              <>New here? <Link to="/auth" search={{ mode: "signup" }} className="font-semibold text-primary">Create an account</Link></>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
