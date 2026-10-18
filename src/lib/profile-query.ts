import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function profileOptions(userId: string) {
  return queryOptions({
    queryKey: ["profile", userId],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function needsProfileSetup(profile: { profile_completed?: boolean | null } | null | undefined) {
  return profile?.profile_completed !== true;
}