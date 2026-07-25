import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function InferenceInbox() {
  const queryClient = useQueryClient();

  const { data: inferences, isLoading } = useQuery({
    queryKey: ["inferences", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_inventory_inferences")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("market_inventory_inferences")
        .update({ status: "confirmed" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Intelligence accepted. Route created.");
      queryClient.invalidateQueries({ queryKey: ["inferences"] });
      // Invalidate routes/trades
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("market_inventory_inferences")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.info("Intelligence rejected. Model updated.");
      queryClient.invalidateQueries({ queryKey: ["inferences"] });
    },
  });

  if (isLoading || !inferences || inferences.length === 0) {
    return null; // Hidden if nothing to review
  }

  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-sm font-bold text-cyber-blue uppercase tracking-widest flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        KI Intelligence Prompts
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inferences.map((inf) => {
          let message = "We detected unusual activity.";
          if (inf.inference_type === "p2p_sell_detected") {
            const ctx = inf.context_data as any;
            message = `Did you just sell ${ctx.crypto_amount} ${ctx.crypto_asset} for ${ctx.fiat_amount} ${ctx.fiat_asset}?`;
          } else if (inf.inference_type === "arbitrage_route_completed") {
            const ctx = inf.context_data as any;
            message = `Arbitrage detected: Moved ${ctx.amount} ${ctx.asset}. Confirm route?`;
          }

          return (
            <Card
              variant="glass"
              key={inf.id}
              className="p-4 border-l-4 border-l-cyber-blue relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-blue to-transparent opacity-50" />

              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    {new Date(inf.created_at).toLocaleTimeString()}
                  </p>
                  <p className="font-semibold text-white mb-4">{message}</p>
                  <div className="flex items-center gap-2 text-xs text-cyber-blue/80 mb-4">
                    <span className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse"></span>
                    Confidence: {(Number(inf.confidence) * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => confirmMutation.mutate(inf.id)}
                    disabled={confirmMutation.isPending}
                    className="flex-1 py-1 px-2 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    YES
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(inf.id)}
                    disabled={rejectMutation.isPending}
                    className="flex-1 py-1 px-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    NO
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
