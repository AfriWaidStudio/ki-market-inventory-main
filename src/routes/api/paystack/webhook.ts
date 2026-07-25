import { createFileRoute } from "@tanstack/react-router";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) return new Response("Missing PAYSTACK_SECRET_KEY", { status: 500 });

        const bodyText = await request.text();
        const hash = crypto.createHmac("sha512", secret).update(bodyText).digest("hex");

        if (hash !== request.headers.get("x-paystack-signature")) {
          return new Response("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(bodyText);

        if (event.event === "charge.success") {
          const ref = event.data.reference;
          const amount = event.data.amount / 100; // Paystack is in kobo

          const supabase = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          // Find the payment intent
          const { data: intent } = await supabase
            .from("payment_intents")
            .select("*")
            .eq("gateway_reference", ref)
            .single();

          if (intent && intent.status === "pending") {
            // Update intent
            await supabase
              .from("payment_intents")
              .update({ status: "success" })
              .eq("id", intent.id);

            // Record transaction in ledger
            await supabase
              .from("wallet_transactions")
              .insert({
                user_id: intent.user_id,
                amount: amount,
                type: "deposit",
                reference: ref,
                status: "success",
              });

            // Credit wallet
            const { data: wallet } = await supabase
              .from("wallets")
              .select("*")
              .eq("user_id", intent.user_id)
              .single();
            
            if (wallet) {
              await supabase
                .from("wallets")
                .update({ balance_fiat: Number(wallet.balance_fiat) + amount })
                .eq("user_id", intent.user_id);
            }
          }
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
