import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Trash2, RefreshCw, KeyRound, UserCircle, Database, ShieldAlert, History } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { CyberButton } from "@/components/ui/CyberButton";
import { CyberInput } from "@/components/ui/CyberInput";
import { GlassCard } from "@/components/ui/GlassCard";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { getUserSettings, updateUserSettings } from "@/lib/settings.functions";
import {
  listApiKeys,
  createApiKey,
  deleteApiKey,
  listAuditLog,
  listExchangeAccounts,
  addExchangeAccount,
  deleteExchangeAccount,
  syncExchangeAccount,
  getSyncStatus,
} from "@/lib/apiKeys.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  loader: async () => {
    const [profile, settings] = await Promise.all([
      getProfile(),
      getUserSettings(),
    ]);
    return { profile, settings };
  },
  head: () => ({ meta: [{ title: "Settings — KI Market Inventory" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const data = Route.useLoaderData();
  const listKeysFn = useServerFn(listApiKeys);
  const createKeyFn = useServerFn(createApiKey);
  const deleteKeyFn = useServerFn(deleteApiKey);
  const auditFn = useServerFn(listAuditLog);
  const listAccountsFn = useServerFn(listExchangeAccounts);
  const addAccountFn = useServerFn(addExchangeAccount);
  const deleteAccountFn = useServerFn(deleteExchangeAccount);
  const syncFn = useServerFn(syncExchangeAccount);
  const syncStatusFn = useServerFn(getSyncStatus);

  const keys = useQuery({ queryKey: ["api-keys"], queryFn: () => listKeysFn() });
  const audit = useQuery({ queryKey: ["audit"], queryFn: () => auditFn() });
  const accounts = useQuery({ queryKey: ["exchange-accounts"], queryFn: () => listAccountsFn() });
  const syncStatus = useQuery({ queryKey: ["sync-status"], queryFn: () => syncStatusFn() });

  const [currency, setCurrency] = useState(data.profile.base_currency ?? "NGN");
  const [telegramId, setTelegramId] = useState(data.settings.telegram_chat_id || "");
  const [keyExchange, setKeyExchange] = useState("Binance");
  const [keyLabel, setKeyLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [apiPassphrase, setApiPassphrase] = useState("");
  const [readOnlyAck, setReadOnlyAck] = useState(false);
  const [acctExchange, setAcctExchange] = useState("Binance");
  const [acctLabel, setAcctLabel] = useState("");

  const saveCurrency = useMutation({
    mutationFn: (c: string) => updateProfile({ data: { base_currency: c } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const saveSettings = useMutation({
    mutationFn: (tid: string) => updateUserSettings({ data: { telegram_chat_id: tid || null } }),
    onSuccess: () => toast.success("Telegram settings saved"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const createKey = useMutation({
    mutationFn: () => createKeyFn({ data: { exchange: keyExchange, key_label: keyLabel, api_key: apiKey, api_secret: apiSecret, api_passphrase: apiPassphrase || undefined } }),
    onSuccess: () => {
      setKeyLabel(""); setApiKey(""); setApiSecret(""); setApiPassphrase(""); setReadOnlyAck(false);
      qc.invalidateQueries({ queryKey: ["api-keys"] }); qc.invalidateQueries({ queryKey: ["audit"] });
      toast.success("API key encrypted and stored");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const removeKey = useMutation({
    mutationFn: (id: string) => deleteKeyFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["api-keys"] }); qc.invalidateQueries({ queryKey: ["audit"] }); toast.success("Deleted"); },
  });
  const addAccount = useMutation({
    mutationFn: () => addAccountFn({ data: { exchange: acctExchange, label: acctLabel || null } }),
    onSuccess: () => { setAcctLabel(""); qc.invalidateQueries({ queryKey: ["exchange-accounts"] }); toast.success("Added"); },
  });
  const deleteAccount = useMutation({
    mutationFn: (id: string) => deleteAccountFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exchange-accounts"] }); toast.success("Deleted"); },
  });
  const syncAccount = useMutation({
    mutationFn: (id: string) => syncFn({ data: { account_id: id } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["sync-status"] });
      toast.success(`Synced ${res.imported} transactions`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Sync failed"),
  });

  return (
    <AppShell title="System Settings">
      <div className="grid gap-6 lg:grid-cols-2 max-w-6xl">
        
        {/* PREFERENCES */}
        <GlassCard className="p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-4">
            <UserCircle className="w-4 h-4 text-cyan-400" /> Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Base Currency</label>
              <select 
                value={currency} 
                onChange={(e) => {
                  setCurrency(e.target.value);
                  saveCurrency.mutate(e.target.value);
                }}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white shadow-inner focus:outline-none focus:border-cyan-500/50 appearance-none font-medium"
              >
                {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Telegram Push Alerts (Chat ID)</label>
              <div className="flex gap-2">
                <CyberInput 
                  value={telegramId} 
                  onChange={(e) => setTelegramId(e.target.value)} 
                  placeholder="e.g. 123456789" 
                  className="flex-1"
                />
                <CyberButton onClick={() => saveSettings.mutate(telegramId)} disabled={saveSettings.isPending}>
                  {saveSettings.isPending ? "Saving..." : "Save"}
                </CyberButton>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">To get your ID, message <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">@userinfobot</a></p>
            </div>
          </div>
        </GlassCard>

        {/* EXCHANGE ACCOUNTS */}
        <GlassCard className="p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-cyan-400" /> Data Sources
          </h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <select value={acctExchange} onChange={(e) => setAcctExchange(e.target.value)} className="w-1/3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white shadow-inner focus:outline-none focus:border-cyan-500/50 appearance-none font-medium">
                {["Binance","Bybit","OKX","KuCoin","Bitget"].map((x) => <option key={x}>{x}</option>)}
              </select>
              <CyberInput value={acctLabel} onChange={(e) => setAcctLabel(e.target.value)} placeholder="Label (optional)" className="flex-1 px-3 py-2" />
              <CyberButton onClick={() => addAccount.mutate()} className="px-4 shrink-0">Add</CyberButton>
            </div>
            
            <div className="rounded-xl bg-black/40 border border-white/5 shadow-inner mt-4">
              <ul className="divide-y divide-white/5">
                {(accounts.data ?? []).map((a: any) => (
                  <li key={a.id} className="flex items-center justify-between p-3 transition-colors hover:bg-white/5">
                    <div>
                      <span className="font-bold text-slate-200">{a.exchange} {a.label && <span className="text-slate-500 font-normal ml-1">— {a.label}</span>}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{a.exchange} {a.label && <span className="text-slate-500 font-normal ml-1">— {a.label}</span>}</span>
                        <CyberBadge variant="success" size="sm">Live Connected</CyberBadge>
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {syncStatus.isLoading ? "Querying status…" : (syncStatus.data?.filter((s: any) => s.account_id === a.id && s.status === 'running').length ? "Syncing..." : "Sync offline")}
                        {syncStatus.data?.find((s: any) => s.account_id === a.id)?.status === 'completed' && " • Verified"}
                        <br />
                        Last sync: {syncStatus.data?.find((s: any) => s.account_id === a.id)?.completed_at
                          ? new Date(syncStatus.data.find((s: any) => s.account_id === a.id)!.completed_at).toLocaleString()
                          : "Never"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CyberButton variant="secondary" onClick={() => syncAccount.mutate(a.id)} disabled={syncAccount.isPending} className="p-2 h-auto text-cyan-400 border-cyan-500/30">
                        <RefreshCw className={`h-4 w-4 ${syncAccount.isPending ? "animate-spin" : ""}`} />
                      </CyberButton>
                      <CyberButton variant="ghost" onClick={() => deleteAccount.mutate(a.id)} className="p-2 h-auto text-rose-400 hover:bg-rose-500/10">
                        <Trash2 className="h-4 w-4" />
                      </CyberButton>
                    </div>
                  </li>
                ))}
                {(accounts.data ?? []).length === 0 && <li className="p-4 text-center text-xs font-medium text-slate-500">No data sources connected.</li>}
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* API KEYS */}
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)] flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Exchange API Keys (Read-Only)
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-400">
                Only add API keys with <strong>read-only permissions</strong>. This app will <strong>never</strong> execute trades, transfers, or withdrawals. Do not grant Withdraw or Trade permissions. Keys are AES-256-GCM encrypted at rest.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-5 mb-4">
            <select value={keyExchange} onChange={(e) => setKeyExchange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white shadow-inner focus:outline-none focus:border-cyan-500/50 appearance-none font-medium">
              {["Binance","Bybit","OKX","KuCoin","Bitget"].map((x) => <option key={x}>{x}</option>)}
            </select>
            <CyberInput value={keyLabel} onChange={(e) => setKeyLabel(e.target.value)} placeholder="Key Label" className="px-3 py-2" />
            <CyberInput value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key" className="px-3 py-2" />
            <CyberInput value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="API Secret" type="password" className="px-3 py-2" />
            {["OKX", "KuCoin", "Bitget"].includes(keyExchange) && (
              <CyberInput value={apiPassphrase} onChange={(e) => setApiPassphrase(e.target.value)} placeholder="Passphrase" type="password" className="px-3 py-2" />
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-300 cursor-pointer">
              <div className="relative flex items-center">
                <input type="checkbox" checked={readOnlyAck} onChange={(e) => setReadOnlyAck(e.target.checked)} className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-white/20 bg-black/40 checked:border-cyan-400 checked:bg-cyan-500/20 transition-all" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 opacity-0 peer-checked:opacity-100">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                </div>
              </div>
              I confirm this key has strictly read-only permissions.
            </label>
            <CyberButton
              onClick={() => createKey.mutate()}
              disabled={!readOnlyAck || !keyLabel || !apiKey || !apiSecret || createKey.isPending}
              className="w-full sm:w-auto"
            >
              {createKey.isPending ? "Encrypting…" : "Add Key"}
            </CyberButton>
          </div>

          <div className="mt-8 rounded-xl bg-black/40 border border-white/5 shadow-inner">
            <ul className="divide-y divide-white/5">
              {(keys.data ?? []).map((k: any) => (
                <li key={k.id} className="flex flex-wrap items-center justify-between p-4 gap-4 hover:bg-white/5 transition-colors">
                  <div>
                    <div className="font-bold text-slate-200">{k.exchange} <span className="text-slate-500 font-normal ml-1">— {k.key_label}</span></div>
                    <div className="text-xs font-medium text-slate-500 mt-1">Added {new Date(k.created_at as string).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CyberBadge variant="info">{k.permissions}</CyberBadge>
                    <CyberButton variant="ghost" onClick={() => removeKey.mutate(k.id)} className="p-2 h-auto text-rose-400 hover:bg-rose-500/10">
                      <Trash2 className="w-4 h-4" />
                    </CyberButton>
                  </div>
                </li>
              ))}
              {(keys.data ?? []).length === 0 && <li className="p-4 text-center text-xs font-medium text-slate-500">No API keys registered.</li>}
            </ul>
          </div>
        </GlassCard>

        {/* SYNC HISTORY */}
        <GlassCard className="p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-4">
            <RefreshCw className="w-4 h-4 text-cyan-400" /> Sync Matrix
          </h2>
          <div className="max-h-64 overflow-y-auto pr-2 rounded-xl bg-black/40 border border-white/5 shadow-inner scrollbar-hide p-2">
            {syncStatus.data?.length ? (
              syncStatus.data.map((s: any) => (
                <div key={s.id} className="flex justify-between items-center p-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-lg">
                  <div>
                    <span className="font-bold text-slate-300 text-sm">{s.exchange}</span>
                    <div className="text-xs font-medium mt-0.5 text-slate-500">
                      <span className={s.status === "completed" ? "text-emerald-400" : s.status === "failed" ? "text-rose-400" : "text-cyan-400"}>
                        {s.status === "running" ? "Running…" : s.status === "completed" ? "Completed" : "Failed"}
                      </span>
                      {s.records_imported > 0 && ` • ${s.records_imported} items`}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {new Date(s.started_at).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-medium text-center p-4 text-slate-500">No sync history available.</p>
            )}
          </div>
        </GlassCard>

        {/* AUDIT LOG */}
        <GlassCard className="p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-cyan-400" /> Security Audit Log
          </h2>
          <div className="max-h-64 overflow-y-auto rounded-xl bg-black/40 border border-white/5 shadow-inner scrollbar-hide p-3">
            {(audit.data ?? []).map((a: any) => (
              <div key={a.id} className="flex flex-col gap-1 border-b border-white/5 last:border-0 py-2.5">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-cyan-400">{a.action}</span>
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{new Date(a.created_at as string).toLocaleDateString()}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 truncate w-full">{a.metadata ? JSON.stringify(a.metadata) : "—"}</span>
              </div>
            ))}
            {(audit.data ?? []).length === 0 && <p className="text-xs font-medium text-center p-3 text-slate-500">No security events recorded.</p>}
          </div>
        </GlassCard>

      </div>
    </AppShell>
  );
}
