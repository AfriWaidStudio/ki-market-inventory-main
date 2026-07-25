import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth/middleware";

/** Retrieves the current user's wallet balance */
export const getWalletBalance = createServerFn("GET", async (_, context) => {
  const ctx = await requireAuth(context);
  const { data, error } = await ctx.supabase
    .from("wallets")
    .select("*")
    .eq("user_id", ctx.userId)
    .single();

  if (error) throw new Error("Wallet not found");
  return data;
});

/** Retrieves the current user's subscription tier */
export const getSubscriptionStatus = createServerFn("GET", async (_, context) => {
  const ctx = await requireAuth(context);
  const { data, error } = await ctx.supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", ctx.userId)
    .single();

  if (error) throw new Error("Subscription not found");
  return data;
});

/** Creates a Paystack Payment Intent and Checkout URL */
export const initializePaystackPayment = createServerFn("POST", async (amount: number, context) => {
  const ctx = await requireAuth(context);
  if (amount < 1000) throw new Error("Minimum deposit is 1000 NGN");

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Server configuration error: Missing PAYSTACK_SECRET_KEY");

  const reference = `KI_DEP_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

  // Create intent
  const { data: intent, error: intentErr } = await ctx.supabase
    .from("payment_intents")
    .insert({
      user_id: ctx.userId,
      gateway: "paystack",
      gateway_reference: reference,
      amount: amount,
      status: "pending"
    })
    .select()
    .single();

  if (intentErr || !intent) throw new Error("Failed to create payment intent");

  // Call Paystack API
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: ctx.user.email,
      amount: amount * 100, // Kobo
      reference: reference,
      callback_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/billing`
    })
  });

  const paystackData = await res.json();
  if (!paystackData.status) {
    throw new Error(paystackData.message || "Failed to initialize Paystack");
  }

  return { authorization_url: paystackData.data.authorization_url, reference };
});

/** Upgrades the user's tier by deducting from their wallet */
export const upgradeTier = createServerFn("POST", async (tier: "pro" | "elite", context) => {
  const ctx = await requireAuth(context);
  const price = tier === "pro" ? 5000 : 25000;

  const { data: wallet } = await ctx.supabase
    .from("wallets")
    .select("*")
    .eq("user_id", ctx.userId)
    .single();

  if (!wallet || wallet.balance_fiat < price) {
    throw new Error(`Insufficient funds. You need ${price} NGN to upgrade to ${tier.toUpperCase()}.`);
  }

  // Deduct from wallet
  await ctx.supabase
    .from("wallets")
    .update({ balance_fiat: Number(wallet.balance_fiat) - price })
    .eq("user_id", ctx.userId);

  // Record transaction
  await ctx.supabase
    .from("wallet_transactions")
    .insert({
      user_id: ctx.userId,
      amount: -price,
      type: "subscription_charge",
      reference: `UPGRADE_${tier.toUpperCase()}`,
      status: "success"
    });

  // Extend subscription by 30 days
  const now = new Date();
  const nextMonth = new Date(now.setMonth(now.getMonth() + 1));

  await ctx.supabase
    .from("user_subscriptions")
    .update({
      tier: tier,
      status: "active",
      current_period_end: nextMonth.toISOString()
    })
    .eq("user_id", ctx.userId);

  return { success: true, new_balance: Number(wallet.balance_fiat) - price, tier };
});
