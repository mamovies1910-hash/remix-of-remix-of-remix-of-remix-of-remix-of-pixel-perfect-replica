// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

const env = { ...loadEnv("production", process.cwd(), "VITE_"), ...process.env };

// Fallback public backend settings so builds without .env still connect (publishable key is public).
const FALLBACK_URL = env["VITE_SUPABASE_URL"] || "https://jbtsqlerggltvdxckqmx.supabase.co";
const FALLBACK_KEY = env["VITE_SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_W-rQCNnYBd5MRbaHgQHHcA_PnGwxnbn";

export default defineConfig({
  vite: {
    define: env["VITE_SUPABASE_URL"] ? {} : {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(FALLBACK_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(FALLBACK_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify("jbtsqlerggltvdxckqmx"),
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
