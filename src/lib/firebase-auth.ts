import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification,
  sendPasswordResetEmail, signOut, type Auth, type User,
} from "firebase/auth";
import { getDatabase, ref, update } from "firebase/database";
import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { firebaseConfig } from "./firebase-config";
import { exchangeFirebaseIdentity } from "./firebase.functions";
import { getFirebaseWebKey } from "./firebase-web.functions";

let appPromise: Promise<FirebaseApp> | null = null;

function firebaseApp() {
  appPromise ??= (async () => {
    const existing = getApps().find((a) => a.name === "earning-auth");
    if (existing) return existing;
    const { apiKey } = await getFirebaseWebKey();
    return initializeApp({ ...firebaseConfig, apiKey }, "earning-auth");
  })().catch((e) => { appPromise = null; throw e; });
  return appPromise;
}

export async function firebaseAuth(): Promise<Auth> {
  return getAuth(await firebaseApp());
}

// Sends the Firebase ID token so the server can verify who is signing in.
export const attachFirebaseIdentity = createMiddleware({ type: "function" }).client(async ({ next }) => {
  if (typeof window === "undefined") return next();
  const auth = await firebaseAuth();
  await auth.authStateReady();
  const user = auth.currentUser;
  return next({ headers: user ? { "X-Firebase-Token": await user.getIdToken() } : {} });
});

// A Firebase account opens the app account only after its email is verified.
async function openAppAccount(user: User) {
  await user.reload();
  if (!user.emailVerified) {
    await sendEmailVerification(user);
    await signOut(await firebaseAuth());
    return { verified: false as const };
  }
  await user.getIdToken(true);
  const session = await exchangeFirebaseIdentity();
  const { error } = await supabase.auth.setSession(session);
  if (error) throw new Error("Unable to open your account.");
  return { verified: true as const };
}

export async function firebaseSignUp(email: string, password: string) {
  const auth = await firebaseAuth();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(user);
  await saveFirebaseProfile({ email, createdAt: Date.now() }, user);
  await signOut(auth);
}

export async function firebaseLogin(email: string, password: string) {
  const auth = await firebaseAuth();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return openAppAccount(user);
}

export async function firebaseResetPassword(email: string) {
  await sendPasswordResetEmail(await firebaseAuth(), email);
}

export async function firebaseSignOut() {
  await signOut(await firebaseAuth());
}

// Profile details (name, email, photo link) kept in Firebase Realtime Database under users/<uid>.
// Passwords never go here; Firebase Authentication keeps them securely.
export async function saveFirebaseProfile(data: Record<string, string | number | null>, forUser?: User) {
  const auth = await firebaseAuth();
  await auth.authStateReady();
  const user = forUser ?? auth.currentUser;
  if (!user) return;
  await update(ref(getDatabase(await firebaseApp()), `users/${user.uid}`), { ...data, updatedAt: Date.now() });
}

export function authError(error: unknown) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code.includes("operation-not-allowed")) return "Email/Password sign-in is turned off in Firebase Authentication.";
  if (code.includes("unauthorized-domain")) return "Add this website to Firebase Authentication's authorized domains.";
  if (code.includes("email-already-in-use")) return "This email already has an account. Please log in.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Wrong email or password.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("too-many-requests")) return "Too many tries. Please wait a few minutes.";
  if (code.includes("api-key")) return "Login is not configured correctly (Firebase key).";
  if (error instanceof Error && error.message && !code) return error.message;
  return "Sign-in could not finish. Please retry.";
}
