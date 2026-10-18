import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const uploadAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(data => z.object({ image: z.string().max(7_000_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/) }).parse(data))
  .handler(async ({ data }) => {
    const key = process.env['IMGBB_API_KEY'];
    if (!key) throw new Error("Photo upload is not configured.");
    const body = new FormData();
    body.set("key", key);
    body.set("image", data.image.replace(/^data:image\/jpeg;base64,/, ""));
    const response = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body });
    if (!response.ok) throw new Error("Photo could not upload. Please retry.");
    const result = await response.json() as { success?: boolean; data?: { url?: string } };
    const url = result.data?.url;
    if (!result.success || !url || new URL(url).protocol !== "https:") throw new Error("Photo could not upload. Please retry.");
    return { url };
  });