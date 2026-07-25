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
    return data ?? { telegram_chat_id: null, max_exchange_exposure_pct: 40 };
  });

const SettingsInput = z.object({
  telegram_chat_id: z.string().optional().nullable(),
  max_exchange_exposure_pct: z.number().min(5).max(100).default(40).optional(),
});
export const updateUserSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SettingsInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("market_inventory_user_settings").upsert({
      user_id: context.userId,
      telegram_chat_id: data.telegram_chat_id,
      max_exchange_exposure_pct: data.max_exchange_exposure_pct,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
