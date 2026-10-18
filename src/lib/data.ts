import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { readDemoUser } from "@/lib/demo-auth";
import { readDemoSubs } from "@/lib/demo-tasks";

export function money(n: number | null | undefined, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(n ?? 0));
}
export function errMsg(e: unknown) {
  return e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Something went wrong";
}
export function maskAccount(s?: string | null) {
  if (!s) return "";
  return "•••• " + s.slice(-4);
}

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const demo = readDemoUser();
      if (demo) return { id: "demo-user", email: demo.email } as const;
      return (await supabase.auth.getUser()).data.user;
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const demo = readDemoUser();
      if (demo) {
        return {
          id: "demo-user",
          full_name: demo.full_name,
          email: demo.email,
          phone: demo.phone,
          avatar_url: demo.avatar_url || null,
          country: "India",
          preferred_language: "en",
          profile_completed: true,
          account_status: "active",
        };
      }
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (readDemoUser()) return true; // demo mode: admin panel visible for preview
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin");
      return (data?.length ?? 0) > 0;
    },
  });
}

export function useBalances() {
  return useQuery({
    queryKey: ["balances"],
    queryFn: async () => {
      if (readDemoUser()) {
        const earned = readDemoSubs().reduce((s, x) => s + x.reward, 0);
        return { available: earned, pending: 0, total_earned: earned, withdrawn: 0 };
      }
      const { data, error } = await supabase.rpc("get_my_balances");
      if (error) throw error;
      return data?.[0] ?? { available: 0, pending: 0, total_earned: 0, withdrawn: 0 };
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useMySubmissions() {
  return useQuery({
    queryKey: ["my-subs"],
    queryFn: async () => {
      if (readDemoUser()) {
        return readDemoSubs().map((s) => ({ task_id: s.task_id, status: "approved", reward_amount: s.reward, submitted_at: s.at }));
      }
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("task_submissions").select("*, tasks(title, reward_amount)").eq("user_id", u.user!.id).order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (readDemoUser()) {
        return [
          { id: "demo-1", title: "Watch a video ad", description: "Watch a short ad to earn a reward.", reward_amount: 5, is_active: true, created_at: new Date().toISOString() },
          { id: "demo-2", title: "Complete a survey", description: "Answer a few quick questions.", reward_amount: 10, is_active: true, created_at: new Date().toISOString() },
          { id: "demo-3", title: "Join a community", description: "Join our channel and stay connected.", reward_amount: 8, is_active: true, created_at: new Date().toISOString() },
          { id: "demo-4", title: "Daily check-in", description: "Open the app and claim your daily bonus.", reward_amount: 2, is_active: true, created_at: new Date().toISOString() },
          { id: "demo-5", title: "Share with a friend", description: "Share the app link with a friend.", reward_amount: 15, is_active: true, created_at: new Date().toISOString() },
        ];
      }
      const { data, error } = await supabase.from("tasks").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export const STATUS_TONE: Record<string, string> = {
  available: "bg-primary-soft text-primary",
  submitted: "bg-info/15 text-info",
  under_review: "bg-warning/20 text-foreground",
  pending: "bg-warning/20 text-foreground",
  approved: "bg-success/15 text-success",
  processing: "bg-info/15 text-info",
  paid: "bg-success/15 text-success",
  rewarded: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  failed: "bg-destructive/15 text-destructive",
  active: "bg-success/15 text-success",
  suspended: "bg-destructive/15 text-destructive",
};
