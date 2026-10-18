import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";

export async function googleSignIn() {
  const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
  if (r.error) toast.error(r.error.message);
  return r;
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
      <path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.68 3.7 14.55 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.07-1.06-.15-1.11z" />
    </svg>
  );
}
