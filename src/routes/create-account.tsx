import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Camera, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LangSelect, Logo } from "@/components/common";
import { GoogleIcon } from "@/components/google";
import { errMsg } from "@/lib/data";
import { readPending, savePending } from "@/lib/pending-signup";
import { demoSignIn } from "@/lib/demo-auth";
import { fileToAvatar } from "@/lib/avatar";

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
  component: CreateAccount,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid Gmail address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function CreateAccount() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [f, setF] = useState({ full_name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = readPending();
    setPhone(p.phone ?? "");
    setAvatar(p.avatar_url ?? "");
    setF((x) => ({ ...x, full_name: p.full_name ?? "" }));
  }, []);

  const ready = !!avatar && f.full_name.trim().length >= 2;

  function keep() {
    savePending({ full_name: f.full_name.trim(), avatar_url: avatar });
  }

  async function withEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!avatar) { toast.error("Please add your profile photo"); return; }
    const r = schema.safeParse(f);
    if (!r.success) { toast.error(r.error.issues[0]?.message ?? "Check your details"); return; }
    keep();
    setBusy(true);
    // Demo mode: details are kept locally and the user goes straight to Home.
    demoSignIn({ full_name: r.data.full_name, email: r.data.email, phone, avatar_url: avatar });
    setBusy(false);
    toast.success("Account created (demo)");
    nav({ to: "/home" });
  }

  async function withGoogle() {
    if (!ready) { toast.error("Add your photo and name first"); return; }
    keep();
    demoSignIn({ full_name: f.full_name.trim(), phone, avatar_url: avatar });
    toast.success("Signed in with Google (demo)");
    nav({ to: "/home" });
  }

  return (
    <div className="min-h-screen bg-soft">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 py-5"><Logo /><LangSelect /></header>
      <main className="mx-auto max-w-md px-5 pb-16">
        <div className="rounded-3xl border bg-card p-6 shadow-card">
          {sentTo ? (
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary"><MailCheck className="h-8 w-8" /></div>
              <h1 className="mt-4 text-2xl font-bold">Verify your Gmail</h1>
              <p className="mt-2 text-sm text-muted-foreground">We sent a link to <b className="text-foreground">{sentTo}</b>. Open it to verify — then you'll confirm your profile and go to Home.</p>
              <Button asChild variant="outline" className="mt-5 w-full"><Link to="/auth" search={{ mode: "login" }}>Already verified? Log in</Link></Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Create your account</h1>
              {phone && <p className="mt-1 flex items-center gap-1 text-sm text-success"><BadgeCheck className="h-4 w-4" /> {phone} verified</p>}
              <p className="mt-1 text-sm text-muted-foreground">Add your photo and name, then verify your Gmail. All fields are required.</p>

              <div className="mt-5 flex flex-col items-center gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-primary-soft text-primary">
                  {avatar ? <img src={avatar} alt="Your photo" className="h-full w-full object-cover" /> : <Camera className="h-9 w-9" />}
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  try { setAvatar(await fileToAvatar(file)); } catch (err) { toast.error(errMsg(err)); }
                }} />
                <span className="text-xs text-muted-foreground">{avatar ? "Tap to change photo" : "Profile photo (required)"}</span>
              </div>

              <form onSubmit={withEmail} className="mt-5 space-y-4">
                <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" required value={f.full_name} maxLength={80} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>
                <Button type="button" variant="outline" size="lg" className="w-full" disabled={!ready} onClick={withGoogle}><GoogleIcon /> Verify with Gmail (Google)</Button>
                <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or use Gmail + password<span className="h-px flex-1 bg-border" /></div>
                <div className="space-y-1.5"><Label htmlFor="email">Gmail</Label><Input id="email" type="email" placeholder="you@gmail.com" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={!ready || busy}>{busy ? "Creating…" : "Create account & verify Gmail"}</Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
