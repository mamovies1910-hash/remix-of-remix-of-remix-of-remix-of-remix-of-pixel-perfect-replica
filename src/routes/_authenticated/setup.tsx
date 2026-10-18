import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LangSelect, Logo } from "@/components/common";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, errMsg } from "@/lib/data";
import { useT, type Lang } from "@/lib/i18n";
import { fileToAvatar } from "@/lib/avatar";
import { clearPending, readPending } from "@/lib/pending-signup";
import { uploadAvatar } from "@/lib/avatar.functions";
import { saveFirebaseProfile } from "@/lib/firebase-auth";
import { needsProfileSetup, profileOptions } from "@/lib/profile-query";

export const Route = createFileRoute("/_authenticated/setup")({
  beforeLoad: async ({ context }) => {
    const profile = await context.queryClient.ensureQueryData(profileOptions(context.userId));
    if (!needsProfileSetup(profile)) throw redirect({ to: "/home" });
  },
  head: () => ({ meta: [{ title: "Complete your profile — Earn to Each Other" }, { name: "description", content: "Set up your Earn to Each Other profile." }, { property: "og:title", content: "Profile setup — Earn to Each Other" }, { property: "og:description", content: "Set up your profile." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Setup,
});

function Setup() {
  const { setLang } = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: p } = useProfile();
  const [f, setF] = useState({ full_name: "", country: "India", preferred_language: "en", avatar_url: "" as string | null });
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (p) {
      const pend = readPending();
      setF({ full_name: p.full_name || pend.full_name || "", country: p.country ?? "India", preferred_language: p.preferred_language ?? "en", avatar_url: p.avatar_url || pend.avatar_url || null });
      setEmail(p.email ?? "");
    }
  }, [p]);

  const valid = !!f.avatar_url && f.full_name.trim().length >= 2 && agree;

  async function finish() {
    if (!p || busy || !valid) return;
    setBusy(true);
    try {
      // Photo goes to imgBB; only its link is saved.
      let avatar = f.avatar_url;
      if (avatar?.startsWith("data:")) avatar = (await uploadAvatar({ data: { image: avatar } })).url;
      const full_name = f.full_name.trim();
      const { data: saved, error } = await supabase.from("profiles").update({
        full_name, country: f.country, preferred_language: f.preferred_language, avatar_url: avatar, profile_completed: true,
      }).eq("id", p.id).select("*").single();
      if (error) throw error;
      if (!saved.profile_completed) throw new Error("Profile could not be saved. Please retry.");
      qc.setQueryData(profileOptions(p.id).queryKey, saved);
      clearPending();
      setLang(f.preferred_language as Lang);
      void Promise.race([
        saveFirebaseProfile({ name: full_name, email, photoUrl: avatar ?? null, country: f.country }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Profile sync timed out")), 10_000)),
      ]).catch(() => toast.warning("Profile saved. Firebase copy could not be confirmed yet."));
      await nav({ to: "/home", replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-soft">
      <header className="mx-auto flex max-w-lg items-center justify-between px-5 py-5"><Logo /><LangSelect /></header>
      <main className="mx-auto max-w-lg px-5 pb-16">
        <h1 className="text-2xl font-bold">Complete your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a photo and your username to start earning.</p>
        <div className="mt-5 space-y-5 rounded-3xl border bg-card p-6 shadow-card">
          <div className="flex flex-col items-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Upload profile photo" className="relative">
              <span className="grid h-32 w-32 place-items-center overflow-hidden rounded-full border-4 border-card bg-primary-soft text-primary shadow-card">
                {f.avatar_url ? <img src={f.avatar_url} alt="Preview" className="h-full w-full object-cover" /> : <Camera className="h-10 w-10" />}
              </span>
              <span className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-card"><Plus className="h-5 w-5" /></span>
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              try { setF({ ...f, avatar_url: await fileToAvatar(file) }); } catch (err) { toast.error(errMsg(err)); }
            }} />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{f.avatar_url ? "Tap photo to change" : "Tap to upload photo"}</span>
              {f.avatar_url && <Button size="sm" variant="ghost" onClick={() => setF({ ...f, avatar_url: null })}><Trash2 /> Remove</Button>}
            </div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="username">Username</Label><Input id="username" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} maxLength={80} placeholder="Your name" /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={email} disabled /></div>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
            <span>I agree to the <Link to="/terms" className="font-semibold text-primary">Terms & Conditions</Link> and <Link to="/privacy" className="font-semibold text-primary">Privacy Policy</Link></span>
          </label>
          <Button variant="hero" size="lg" className="w-full" disabled={!valid || busy} onClick={finish}><Check /> {busy ? "Saving…" : "Continue"}</Button>
        </div>
      </main>
    </div>
  );
}
