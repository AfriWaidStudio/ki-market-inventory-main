import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { requestPasswordReset, resetPassword } from "@/lib/auth/functions";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Zap, Lock } from "lucide-react";

type Search = { reset?: string; oauth_error?: string };
export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    reset: typeof search.reset === "string" ? search.reset : undefined,
    oauth_error: typeof search.oauth_error === "string" ? search.oauth_error : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — KI Market Inventory" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">(search.reset ? "reset" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { isAuthenticated, signIn, signUp, signInWithOAuth, loading } = useAuth();

  useEffect(() => { if (search.oauth_error) toast.error(search.oauth_error); }, [search.oauth_error]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "forgot") {
      await requestPasswordReset({ data: { email } });
      toast.success("If that account exists, a reset link has been created.");
      setMode("signin"); return;
    }
    if (mode === "reset" && search.reset) {
      const result = await resetPassword({ data: { token: search.reset, password } });
      if (result.error) return toast.error(result.error);
      toast.success("Password updated. You can now sign in."); setMode("signin"); return;
    }
    const result = mode === "signup" ? await signUp(email, password, displayName) : await signIn(email, password);
    if (result.error) toast.error(result.error);
    else if (mode === "signup") toast.success("Account created.");
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  const showEmail = mode !== "reset";
  const showPassword = mode !== "forgot";
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#030712] text-slate-200 selection:bg-cyan-500/30 overflow-hidden relative">
      {/* GLOBAL 3D LIGHTING & MESH BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-700/10 blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center mb-4 border border-white/20">
            <Zap className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Command Center</h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">Encrypted P2P Intelligence Platform</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          {(mode === "signin" || mode === "signup") && (
            <div className="flex gap-2 rounded-xl bg-black/50 p-1.5 text-sm mb-6 shadow-inner border border-white/5">
              <button type="button" onClick={() => setMode("signin")} className={`flex-1 rounded-lg py-2.5 font-semibold transition-all ${mode === "signin" ? "bg-slate-800 text-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] border border-white/10" : "text-slate-400 hover:text-slate-200"}`}>Sign In</button>
              <button type="button" onClick={() => setMode("signup")} className={`flex-1 rounded-lg py-2.5 font-semibold transition-all ${mode === "signup" ? "bg-slate-800 text-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] border border-white/10" : "text-slate-400 hover:text-slate-200"}`}>Create Account</button>
            </div>
          )}
          
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Display name
                <input className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white shadow-inner focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all" value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </label>
            )}
            {showEmail && (
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Email
                <input type="email" required className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white shadow-inner focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all" value={email} onChange={e => setEmail(e.target.value)} />
              </label>
            )}
            {showPassword && (
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                {mode === "reset" ? "New password" : "Password"}
                <input type="password" required minLength={10} className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white shadow-inner focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all" value={password} onChange={e => setPassword(e.target.value)} />
              </label>
            )}
            
            <button disabled={loading} className="w-full mt-2 relative flex items-center justify-center px-6 py-4 text-base font-bold text-black bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_5px_15px_rgba(147,51,234,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_20px_rgba(6,182,212,0.4)] active:translate-y-[2px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_2px_5px_rgba(0,0,0,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Working…" : mode === "signup" ? "Create Account" : mode === "forgot" ? "Send Reset Link" : mode === "reset" ? "Set New Password" : "Sign In Securely"}
              {!loading && <Lock className="w-4 h-4 ml-2 opacity-50" />}
            </button>
          </form>
          
          <div className="flex flex-col items-center mt-4">
            {mode === "signin" && <button type="button" onClick={() => setMode("forgot")} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Forgot password?</button>}
            {(mode === "forgot" || mode === "reset") && <button type="button" onClick={() => setMode("signin")} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Back to sign in</button>}
          </div>

          {(mode === "signin" || mode === "signup") && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs font-bold text-slate-500">
                <div className="h-px flex-1 bg-white/10" />
                OR
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <button type="button" onClick={() => void signInWithOAuth("google")} className="w-full relative flex items-center justify-center px-6 py-3.5 text-sm font-bold text-white bg-slate-800 rounded-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.3)] hover:bg-slate-700 active:translate-y-[2px] active:shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)] transition-all duration-200">
                Continue with Google
              </button>
            </>
          )}
        </div>
        
        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Tracking-only tool. <Link to="/" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">Back to platform</Link>
        </p>
      </motion.div>
    </div>
  );
}
