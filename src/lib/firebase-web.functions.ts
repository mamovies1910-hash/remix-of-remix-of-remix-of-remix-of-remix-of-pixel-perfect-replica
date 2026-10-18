import { createServerFn } from "@tanstack/react-start";

// The Firebase web API key identifies the project and is safe for browsers.
export const getFirebaseWebKey = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env["GOOGLE_API_KEY"]?.trim();
  if (!apiKey) throw new Error("Login is not configured yet.");
  return { apiKey };
});
