import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { analyticsSeries } from "@/lib/analytics.functions";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — KI Market Inventory" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const fn = useServerFn(analyticsSeries);
  const q = useQuery({ queryKey: ["analytics-series"], queryFn: () => fn() });

  if (q.isLoading) return <AppShell title="Analytics"><div className="text-slate-400 font-medium animate-pulse">Loading analytics matrix…</div></AppShell>;
  const d = q.data ?? { profitByDay: [], profitByType: [], profitByHour: [], capitalGrowth: [], kiAccuracy: 0 };

  return (
    <AppShell title="Profit Analytics">
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <StatCard label="Closed trades" value={`${d.profitByDay.length} days tracked`} />
        <StatCard label="KI accuracy" value={`${(d.kiAccuracy * 100).toFixed(1)}%`} tone="profit" />
        <StatCard label="Best hour" value={bestHourLabel(d.profitByHour)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Profit by day">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={d.profitByDay}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(12px)", color: "#fff" }} 
                itemStyle={{ color: "#22d3ee", fontWeight: "bold" }}
              />
              <Line type="monotone" dataKey="profit" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: "#0f172a", stroke: "#22d3ee", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#22d3ee", stroke: "#fff" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Paper vs manual realized profit">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.profitByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(12px)", color: "#fff" }} 
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="manual" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="paper" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cumulative capital growth">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={d.capitalGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(12px)", color: "#fff" }} 
              />
              <Line type="monotone" dataKey="cumulative" stroke="#34d399" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#34d399", stroke: "#fff" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Profit by hour of day" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.profitByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(12px)", color: "#fff" }} 
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="profit" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </AppShell>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative group overflow-hidden rounded-[2rem] bg-slate-900/50 backdrop-blur-xl p-6 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_35px_rgba(0,0,0,0.5)] transition-all ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10">
        <h3 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm mb-6">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function bestHourLabel(rows: Array<{ hour: number; profit: number }>): string {
  if (!rows.length) return "—";
  const best = [...rows].sort((a, b) => b.profit - a.profit)[0];
  if (best.profit <= 0) return "—";
  return `${best.hour.toString().padStart(2, "0")}:00`;
}
