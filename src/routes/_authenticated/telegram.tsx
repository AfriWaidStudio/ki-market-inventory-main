import { MessageSquare } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createTelegramLink, getTelegramStatus, unlinkTelegram } from "@/lib/telegram.functions";
import { Send, CheckCircle2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/telegram")({ component: TelegramPage });

function TelegramPage() {
  const statusFn = useServerFn(getTelegramStatus);
  const linkFn = useServerFn(createTelegramLink);
  const unlinkFn = useServerFn(unlinkTelegram);
  const qc = useQueryClient();

  const status = useQuery({ queryKey: ["telegram-status"], queryFn: () => statusFn() });
  const link = useMutation({
    mutationFn: () => linkFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["telegram-status"] }),
  });
  const unlink = useMutation({
    mutationFn: () => unlinkFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["telegram-status"] }),
  });

  return (
    <AppShell
      title="Telegram KI"
      description="AI-driven notifications and signals via Telegram."
      icon={MessageSquare}
    >
      <Card variant="glass" className="max-w-xl p-6 lg:p-8">
        {status.data?.linked_at ? (
          <div className="mt-8 p-5 rounded-xl bg-black/40 border border-white/5 shadow-inner flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">
              <CheckCircle2 className="w-5 h-5" /> Link Active
            </div>
            <Button
              variant="cyber-ghost"
              onClick={() => unlink.mutate()}
              className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              Disconnect Uplink
            </Button>
          </div>
        ) : (
          <div className="mt-8">
            <Button onClick={() => link.mutate()} className="w-full h-12 text-sm">
              Generate 10-Minute Auth Code
            </Button>
            {link.data && (
              <div className="mt-6 rounded-xl bg-black/60 border border-cyan-500/30 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_20px_rgba(6,182,212,0.1)] text-center">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Auth Code
                </div>
                <strong className="font-mono text-3xl font-black text-cyan-400 drop-shadow-glow-cyan tracking-widest block mb-4">
                  {link.data.code}
                </strong>
                {link.data.url && (
                  <a
                    href={link.data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 font-bold text-white bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg transition-colors border border-white/20"
                  >
                    Open Telegram Bot
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-start gap-3 p-4 rounded-lg bg-black/20 border border-white/5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs font-medium text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Available Commands:</strong> <br />
            /status · /positions · /market · /explain · /mute · /settings
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
