import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "./auth";

/**
 * Enqueue a background job with a specified delay or run time.
 * This should be used for rate-limited API calls, heavy exports, etc.
 */
export const enqueueJob = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ context, data }) => {
    const { queueName, payload, delaySeconds = 0 } = data as {
      queueName: string;
      payload: any;
      delaySeconds?: number;
    };

    const runAt = new Date(Date.now() + delaySeconds * 1000).toISOString();

    const { error, data: job } = await context.supabase
      .from("market_inventory_jobs")
      .insert({
        queue_name: queueName,
        payload,
        run_at: runAt,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to enqueue job:", error);
      throw new Error("Failed to enqueue background job");
    }

    return { ok: true, jobId: job.id };
  });

/**
 * Dispatch an external exchange sync job (e.g. for Binance/Bybit).
 */
export const requestExchangeSync = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ context, data }) => {
    const { exchange } = data as { exchange: string };

    const { error } = await context.supabase
      .from("market_inventory_jobs")
      .insert({
        queue_name: "exchange_sync",
        payload: { exchange, user_id: context.userId },
      });

    if (error) {
      throw new Error("Failed to queue exchange sync. Try again later.");
    }

    return { ok: true };
  });
