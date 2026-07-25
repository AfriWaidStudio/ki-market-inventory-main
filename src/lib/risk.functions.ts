import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth/middleware";
import { z } from "zod";

export const listRiskAlerts = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("market_inventory_risk_alerts")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const IdInput = z.object({ id: z.string().uuid() });

export const dismissRiskAlert = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("market_inventory_risk_alerts")
      .update({ dismissed_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getExposureReport = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    // get user settings
    const { data: settings } = await context.supabase
      .from("market_inventory_user_settings")
      .select("max_exchange_exposure_pct")
      .eq("user_id", context.userId)
      .single();

    const maxPct = settings?.max_exchange_exposure_pct ?? 40;

    // get active trades
    const { data: trades } = await context.supabase
      .from("market_inventory_trades")
      .select("buy_exchange, sell_exchange, total_fiat_spent")
      .eq("status", "active")
      .is("deleted_at", null)
      .eq("user_id", context.userId);

    const active = trades ?? [];
    let totalCapital = 0;
    const byExchange: Record<string, number> = {};

    for (const t of active) {
      const amt = Number(t.total_fiat_spent) || 0;
      totalCapital += amt;
      byExchange[t.buy_exchange] = (byExchange[t.buy_exchange] || 0) + amt;
    }

    const report: Array<{ exchange: string; capital: number; pct: number; is_breached: boolean }> =
      [];
    for (const [exchange, capital] of Object.entries(byExchange)) {
      const pct = totalCapital > 0 ? (capital / totalCapital) * 100 : 0;
      report.push({
        exchange,
        capital,
        pct,
        is_breached: pct > maxPct,
      });
    }

    return { maxPct, totalCapital, breakdown: report };
  });
