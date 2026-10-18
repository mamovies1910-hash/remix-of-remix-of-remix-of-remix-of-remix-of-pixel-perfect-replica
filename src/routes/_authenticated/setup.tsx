import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { cn } from "@/lib/utils";
import { fileToAvatar } from "@/lib/avatar";
import { clearPending, readPending } from "@/lib/pending-signup";
import { demoSignIn, readDemoUser } from "@/lib/demo-auth";
import { COUNTRIES } from "@/lib/countries";
import { Flag } from "@/components/flag";

export const Route = createFileRoute("/_authenticated/setup")({
  head: () => ({ meta: [{ title: "Complete your profile — Earn to Each Other" }, { name: "description", content: "Set up your Earn to Each Other profile." }, { property: "og:title", content: "Profile setup — Earn to Each Other" }, { property: "og:description", content: "Set up your profile." }] }),
  component: Setup,
});

function Setup() {
  const { t, setLang } = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: p } = useProfile();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ full_name: "", phone: "", country: "India", preferred_language: "en", avatar_url: "" as string | null });
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (p) {
      const pend = readPending();
      setF({ full_name: p.full_name || pend.full_name || "", phone: p.phone || pend.phone || "", country: p.country ?? "India", preferred_language: p.preferred_language ?? "en", avatar_url: p.avatar_url || pend.avatar_url || null });
      setEmail(p.email ?? "");
    }
  }, [p]);

  const valid0 = !!f.avatar_url;
  const [verified, setVerified] = useState(false);
  const valid1 = f.full_name.trim().length >= 2 && verified;

  async function finish() {
    setBusy(true);
    if (readDemoUser()) {
      // Demo mode: no backend — save details locally and go Home.
      demoSignIn({ full_name: f.full_name.trim(), phone: f.phone.trim(), ...(f.avatar_url ? { avatar_url: f.avatar_url } : {}), email });
      setBusy(false);
      clearPending();
      setLang(f.preferred_language as Lang);
      nav({ to: "/home" });
      return;
    }
    const { error } = await supabase.from("profiles").update({ ...f, full_name: f.full_name.trim(), phone: f.phone.trim(), profile_completed: true }).eq("id", p!.id);
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    clearPending();
    setLang(f.preferred_language as Lang);
    await qc.invalidateQueries({ queryKey: ["profile"] });
    nav({ to: "/home" });
  }

  const steps = [t("photo"), t("personal"), t("review")];
  return (
    <div className="min-h-screen bg-soft">
      <header className="mx-auto flex max-w-lg items-center justify-between px-5 py-5"><Logo /><LangSelect /></header>
      <main className="mx-auto max-w-lg px-5 pb-16">
        <h1 className="text-2xl font-bold">{t("setupTitle")}</h1>
        <div className="my-5 flex gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
              <p className={cn("mt-1.5 text-xs", i === step ? "font-semibold text-foreground" : "text-muted-foreground")}>{s}</p>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-card">
          {step === 0 && (
            <div className="flex flex-col items-center gap-4">
              <button type="button" onClick={() => fileRef.current?.click()} aria-label="Upload profile photo" className="relative">
                <span className="grid h-32 w-32 place-items-center overflow-hidden rounded-full border-4 border-card bg-primary-soft text-primary shadow-card">
                  {f.avatar_url ? <img src={f.avatar_url} alt="Preview" className="h-full w-full object-cover" /> : <Camera className="h-10 w-10" />}
                </span>
                <span className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-card"><Plus className="h-5 w-5" /></span>
              </button>
              <p className="text-sm font-medium">Tap the photo to upload</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                try { setF({ ...f, avatar_url: await fileToAvatar(file) }); } catch (err) { toast.error(errMsg(err)); }
              }} />
              <div className="flex gap-2">
                <Button variant="soft" onClick={() => fileRef.current?.click()}><Camera /> {f.avatar_url ? "Change" : "Upload"}</Button>
                {f.avatar_url && <Button variant="ghost" onClick={() => setF({ ...f, avatar_url: null })}><Trash2 /> Remove</Button>}
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG or WEBP · up to 5 MB · required</p>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <Field label={t("fullName")}><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} maxLength={80} /></Field>
              <Field label={t("email")}><Input value={email} disabled /></Field>
              <PhoneVerify onVerified={(phone, country) => { setF((x) => ({ ...x, phone, country })); setVerified(true); }} onChange={() => setVerified(false)} verified={verified} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3 text-sm">
              {[[t("fullName"), f.full_name], [t("email"), email], [t("mobile"), f.phone]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b pb-2"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
              ))}
              <label className="flex items-start gap-3 pt-2">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
                <span>{t("acceptTerms")}</span>
              </label>
            </div>
          )}
          <div className="mt-6 flex justify-between gap-2">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>{t("back")}</Button>
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)} disabled={(step === 0 && !valid0) || (step === 1 && !valid1)}>{t("next")}</Button>
            ) : (
              <Button variant="hero" disabled={!agree || busy || !valid0 || !valid1} onClick={finish}><Check /> {t("toDashboard")}</Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}


function PhoneVerify({ verified, onVerified, onChange }: { verified: boolean; onVerified: (phone: string, country: string) => void; onChange: () => void }) {
  const [ci, setCi] = useState(() => Math.max(0, COUNTRIES.findIndex((x) => x.code === "IN")));
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const c = COUNTRIES[ci] ?? COUNTRIES[0]!;

  function send() {
    const n = String(Math.floor(1000 + Math.random() * 9000));
    setCode(n); setOtp(["", "", "", ""]);
    toast.success(`OTP sent to ${c.dial} ${phone}`, { description: `Demo OTP: ${n}`, duration: 10000 });
    setTimeout(() => refs.current[0]?.focus(), 50);
  }
  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const n = [...otp]; n[i] = d; setOtp(n);
    if (d && i < 3) refs.current[i + 1]?.focus();
  }
  function verify() {
    // Demo: any 4 digits accepted until a real SMS service is connected.
    if (otp.join("").length !== 4) return;
    toast.success("Mobile number verified");
    onVerified(`${c.dial} ${phone}`, c.name);
  }

  return (
    <div className="space-y-2">
      <Label>Mobile number</Label>
      <div className="flex gap-2">
        <button type="button" disabled={verified} onClick={() => setOpen(true)} className="flex h-10 shrink-0 items-center gap-1 rounded-md border bg-muted px-3 text-sm font-medium">
          <Flag code={c.code} className="text-lg" /> {c.dial}
          <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        <Input inputMode="numeric" placeholder="Enter mobile number" value={phone} disabled={verified}
          onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, c.digits)); setCode(""); onChange(); }} />
      </div>
      {verified ? (
        <p className="flex items-center gap-1 text-sm font-semibold text-primary"><Check className="h-4 w-4" /> Verified</p>
      ) : !code ? (
        <Button type="button" variant="hero" className="w-full" disabled={phone.length !== c.digits} onClick={send}>Send OTP</Button>
      ) : (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-muted-foreground">Enter the 4-digit OTP sent to {c.dial} {phone}</p>
          <div className="flex justify-center gap-3">
            {otp.map((d, i) => (
              <Input key={i} ref={(el) => { refs.current[i] = el; }} value={d} inputMode="numeric" maxLength={1} aria-label={`OTP digit ${i + 1}`}
                className="h-12 w-12 text-center text-xl font-bold" onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus(); }} />
            ))}
          </div>
          <Button type="button" variant="hero" className="w-full" disabled={otp.join("").length !== 4} onClick={verify}>Verify OTP</Button>
          <button type="button" onClick={send} className="w-full text-center text-sm font-semibold text-primary">Resend OTP</button>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-t-3xl border bg-card p-4 pb-8 shadow-card" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Select country</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">Cancel</button>
            </div>
            <ul className="divide-y">
              {COUNTRIES.map((x, i) => (
                <li key={x.code}>
                  <button type="button" onClick={() => { setCi(i); setPhone(""); setCode(""); setOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left ${i === ci ? "bg-primary-soft" : "hover:bg-muted"}`}>
                    <Flag code={x.code} className="text-2xl" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{x.name}</span>
                      <span className="block text-sm text-muted-foreground">{x.dial}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
