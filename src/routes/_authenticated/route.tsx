import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isDemoSignedIn } from "@/lib/demo-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Demo mode: a locally stored demo profile is enough to enter the app.
    if (isDemoSignedIn()) return { userId: "demo-user" };
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { mode: "login" } });
    return { userId: data.user.id };
  },
  component: () => <Outlet />,
});
