import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function run() {
  const { data: user } = await supabase.from("app_users").select("id").limit(1).single();

  if (!user) {
    console.log("No user found");
    return;
  }

  const { error } = await supabase.from("market_inventory_inferences").insert({
    user_id: user.id,
    inference_type: "p2p_sell_detected",
    confidence: 0.94,
    context_data: {
      crypto_amount: 500,
      crypto_asset: "USDT",
      fiat_amount: 810000,
      fiat_asset: "NGN",
    },
  });

  if (error) {
    console.error("Failed to insert inference:", error);
  } else {
    console.log("Mock inference inserted successfully!");
  }
}

run();
