import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Using service role for backend operations
const supabaseUrl = process.env.VITE_SUPABASE_URL! || process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTest() {
  console.log("Fetching user...");
  // Get an actual user from auth.users using the service role
  const { data: users, error: err } = await supabase.auth.admin.listUsers();

  if (err || !users || users.users.length === 0) {
    console.log("No auth.users found", err);
    return;
  }

  const user = users.users[0];
  console.log("User found:", user.id);
  console.log("Inserting test inference into market_inventory_inferences...");

  const { error } = await supabase.from("market_inventory_inferences").insert({
    user_id: user.id,
    inference_type: "p2p_sell_detected",
    confidence: 0.99,
    status: "pending",
    context_data: {
      crypto_amount: 1200,
      crypto_asset: "USDT",
      fiat_amount: 1950000,
      fiat_asset: "NGN",
    },
  });

  if (error) {
    console.error("Failed to insert inference:", error);
  } else {
    console.log(
      "Mock inference inserted successfully! Check your dashboard, it should appear via Realtime.",
    );
  }
}

runTest();
