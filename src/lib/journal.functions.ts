import { createServerFn } from "@tanstack/react-start";
import { requireAuth as requireSupabaseAuth } from "@/lib/auth/middleware";
import { z } from "zod";

export const getTradeJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ trade_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: journal } = await context.supabase
      .from("market_inventory_trade_journals")
      .select("*")
      .eq("trade_id", data.trade_id)
      .eq("user_id", context.userId)
      .single();
    return journal;
  });

const SaveJournalInput = z.object({
  trade_id: z.string().uuid(),
  emotional_state: z.enum(['fomo', 'anxious', 'confident', 'neutral', 'tilted']),
  lessons_learned: z.string()
});

export const saveTradeJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveJournalInput.parse(d))
  .handler(async ({ data, context }) => {
    
    // AI Risk Scoring logic
    let riskScore = 0;
    if (data.emotional_state === 'fomo' || data.emotional_state === 'tilted') riskScore = 80;
    if (data.emotional_state === 'anxious') riskScore = 50;
    if (data.emotional_state === 'confident' || data.emotional_state === 'neutral') riskScore = 10;

    const { error } = await context.supabase.from("market_inventory_trade_journals").upsert({
      user_id: context.userId,
      trade_id: data.trade_id,
      emotional_state: data.emotional_state,
      lessons_learned: data.lessons_learned,
      ai_risk_score: riskScore,
      updated_at: new Date().toISOString()
    }, { onConflict: 'trade_id' });

    if (error) throw new Error(error.message);
    return { ok: true, riskScore };
  });
