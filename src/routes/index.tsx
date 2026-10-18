import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, PlayCircle, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import hero from "@/assets/hero.jpg";
import promo1 from "@/assets/promo-1.mp4.asset.json";
import promo2 from "@/assets/promo-2.mp4.asset.json";
import { Button } from "@/components/ui/button";
import { LangSelect, Logo } from "@/components/common";
import { useT } from "@/lib/i18n";
import { GoogleIcon } from "@/components/google";
import { demoSignIn, isDemoSignedIn } from "@/lib/demo-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Earn to Each Other — Complete Tasks, Earn Rewards" },
      { name: "description", content: "Join Earn to Each Other, explore tasks, learn new skills and track your rewards from one simple dashboard." },
      { property: "og:title", content: "Earn to Each Other — Complete Tasks, Earn Rewards" },
      { property: "og:description", content: "Explore tasks, learn new skills and track verified rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { t } = useT();
  const nav = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    setSignedIn(isDemoSignedIn());
  }, []);

  // Demo mode: Google button goes straight to Home, no real sign-in.
  function withGoogle() {
    demoSignIn({});
    nav({ to: "/home" });
  }

  return (
    <div className="min-h-screen bg-soft">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <LangSelect />
          {signedIn ? (
            <Button asChild size="sm"><Link to="/home">{t("home")}</Link></Button>
          ) : (
            <Button asChild variant="ghost" size="sm"><Link to="/auth" search={{ mode: "login" }}>{t("login")}</Link></Button>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-4 md:grid-cols-2 md:pt-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified rewards · Transparent payouts
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] md:text-6xl">{t("tagline")}</h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">{t("intro")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:max-w-sm">
            <Button variant="hero" size="lg" onClick={withGoogle}>
              <GoogleIcon /> {t("signupGoogle")}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/phone-signup"><Smartphone /> Sign up with mobile number</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              {t("haveAccount")} <Link to="/auth" search={{ mode: "login" }} className="font-semibold text-primary">{t("login")}</Link>
            </p>
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="People completing tasks together" width={1280} height={1024} className="w-full rounded-3xl object-cover shadow-elegant" />
        </div>
      </main>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="mb-6 text-2xl font-bold">{t("howItWorks")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { i: <PlayCircle />, h: "1. Learn", p: "Watch short guides that explain tasks and rules." },
            { i: <CheckCircle2 />, h: "2. Complete tasks", p: "Finish a task and submit your proof for review." },
            { i: <Wallet />, h: "3. Withdraw", p: "Approved rewards move to your balance. Request a withdrawal anytime above the minimum." },
          ].map((x) => (
            <div key={x.h} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">{x.i}</div>
              <h3 className="font-semibold">{x.h}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{x.p}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Rewards depend on approved task completion. Earnings are not guaranteed.</p>
      </section>

      <section className="bg-promo py-14">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-2xl font-bold">See how it works</h2>
          <p className="mt-1 text-sm text-muted-foreground">Watch real people earning with Earn to Each Other.</p>
          <div className="mx-auto mt-6 grid max-w-3xl gap-6 md:grid-cols-2">
            {[promo1, promo2].map((v, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border-4 border-card bg-card shadow-elegant">
                <video src={v.url} controls playsInline preload="metadata" className="aspect-[9/16] w-full bg-muted object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Earn to Each Other</span>
          <div className="flex gap-4">
            <Link to="/terms">{t("terms")}</Link>
            <Link to="/privacy">{t("privacy")}</Link>
            <Link to="/help">{t("help")}</Link>
          </div>
        </div>
      </footer>
      <span className="sr-only"><ArrowRight /></span>
    </div>
  );
}

