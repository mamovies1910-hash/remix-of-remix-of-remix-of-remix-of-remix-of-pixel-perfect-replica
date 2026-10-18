import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { clearLoginHint, setLoginHint } from "@/lib/login-hint";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Local session read (no network) keeps page changes fast; every data request is still
    // verified by the backend with the session token.
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      clearLoginHint();
      throw redirect({ to: "/auth", search: { mode: "login" } });
    }
    setLoginHint();
    return { userId: user.id };
  },
  component: () => <Outlet />,
});
