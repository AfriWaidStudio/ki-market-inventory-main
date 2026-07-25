import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { requestPasswordReset, resetPassword } from "@/lib/auth/functions";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Shield, Lock } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">(
    search.reset ? "reset" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { isAuthenticated, signIn, signUp, signInWithOAuth, loading } = useAuth();

  useEffect(() => {
    if (search.oauth_error) toast.error(search.oauth_error);
  }, [search.oauth_error]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "forgot") {
      await requestPasswordReset({ data: { email } });
      toast.success("If that account exists, a reset link has been created.");
      setMode("signin");
      return;
    }
    if (mode === "reset" && search.reset) {
      const result = await resetPassword({ data: { token: search.reset, password } });
      if (result.error) return toast.error(result.error);
      toast.success("Password updated. You can now sign in.");
      setMode("signin");
      return;
    }
    const result =
      mode === "signup"
        ? await signUp(email, password, displayName)
        : await signIn(email, password);
    if (result.error) toast.error(result.error);
    else if (mode === "signup") toast.success("Account created.");
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const showEmail = mode !== "reset";
  const showPassword = mode !== "forgot";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground relative overflow-hidden">
      {/* Refined subtle background matching standard dashboard styles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background opacity-50 z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded bg-card flex items-center justify-center mb-4 border border-border">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Encrypted intelligence platform</p>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-4">
            {(mode === "signin" || mode === "signup") && (
              <div className="grid grid-cols-2 gap-2 rounded-md bg-secondary/50 p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`rounded py-1.5 font-medium transition-all ${mode === "signin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`rounded py-1.5 font-medium transition-all ${mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Sign Up
                </button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    placeholder="Trader Alpha"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              )}
              {showEmail && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
              {showPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {mode === "reset" ? "New Password" : "Password"}
                  </label>
                  <Input
                    type="password"
                    required
                    minLength={10}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              <Button disabled={loading} className="w-full mt-2" type="submit">
                {loading
                  ? "Working…"
                  : mode === "signup"
                    ? "Create Account"
                    : mode === "forgot"
                      ? "Send Reset Link"
                      : mode === "reset"
                        ? "Set New Password"
                        : "Sign In"}
                {!loading && <Lock className="w-4 h-4 ml-2 opacity-50" />}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-0">
            <div className="flex flex-col items-center">
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              )}
              {(mode === "forgot" || mode === "reset") && (
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to sign in
                </button>
              )}
            </div>

            {(mode === "signin" || mode === "signup") && (
              <>
                <div className="w-full flex items-center gap-3 text-xs text-muted-foreground uppercase">
                  <div className="h-px flex-1 bg-border" />
                  Or continue with
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void signInWithOAuth("google")}
                  className="w-full"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                  Google
                </Button>
              </>
            )}
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Tracking-only tool.{" "}
          <Link to="/" className="text-primary hover:underline transition-colors">
            Back to platform
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
