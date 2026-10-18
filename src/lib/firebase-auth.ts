import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut, type User } from "firebase/auth";
import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { firebaseConfig } from "./firebase-config";
import { exchangeFirebaseIdentity } from "./firebase.functions";
import { demoSignOut } from "./demo-auth";
import { clearDemoSubs } from "./demo-tasks";

export function firebaseAuth() {
  const app = getApps().find(a => a.name === "earning-auth") ?? initializeApp(firebaseConfig, "earning-auth");
  return getAuth(app);
}
export const attachFirebaseIdentity = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const auth = firebaseAuth();
  await auth.authStateReady();
  const user = auth.currentUser;
  return next({ headers: user ? { "X-Firebase-Token": await user.getIdToken() } : {} });
});
async function openCloudAccount(user: User) {
  await user.reload();
  if (!user.emailVerified) {
    await sendEmailVerification(user);
    return { confirmationRequired: true };
  }
  const session = await exchangeFirebaseIdentity();
  const { error } = await supabase.auth.setSession(session);
  if (error) throw new Error("Unable to open your account.");
  demoSignOut();
  clearDemoSubs();
  return { confirmationRequired: false };
}
export async function firebaseGoogleSignIn() {
  return openCloudAccount((await signInWithPopup(firebaseAuth(), new GoogleAuthProvider())).user);
}
export async function firebaseEmailSignIn(email: string, password: string, signup: boolean) {
  const auth = firebaseAuth();
  const credential = signup ? await createUserWithEmailAndPassword(auth, email, password) : await signInWithEmailAndPassword(auth, email, password);
  return openCloudAccount(credential.user);
}
export async function firebaseSignOut() { await signOut(firebaseAuth()); }
export function authError(error: unknown) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code.includes("operation-not-allowed")) return "Enable Google and Email/Password sign-in in Firebase Authentication.";
  if (code.includes("unauthorized-domain")) return "Add this website domain to Firebase Authentication's authorized domains.";
  if (code.includes("popup-blocked")) return "Allow the Google sign-in popup and try again.";
  if (code.includes("popup-closed")) return "Google sign-in was cancelled.";
  if (code.includes("email-already-in-use")) return "This email already has an account. Please log in.";
  if (code.includes("invalid-credential")) return "Check your email and password.";
  return "Sign-in could not finish. Please retry.";
}