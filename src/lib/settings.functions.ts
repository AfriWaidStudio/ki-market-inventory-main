import { createServerFn } from "@tanstack/react-start";
import { requireAuth as requireSupabaseAuth } from "@/lib/auth/middleware";
import { z } from "zod";

export const getUserSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("market_inventory_user_settings")
      .select("*")
      .eq("user_id", context.userId)
      .single();
    return data ?? { telegram_chat_id: null };
  });

const SettingsInput = z.object({ telegram_chat_id: z.string().optional().nullable() });
export const updateUserSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SettingsInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("market_inventory_user_settings").upsert({
      user_id: context.userId,
      telegram_chat_id: data.telegram_chat_id,
      updated_at: new Date().toISOString()
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
