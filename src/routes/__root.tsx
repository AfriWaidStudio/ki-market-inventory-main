import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#030712] text-slate-200 selection:bg-cyan-500/30 overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
      </div>
      <div className="w-full max-w-md relative z-10 text-center">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-12 shadow-glass-strong backdrop-blur-xl">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 drop-shadow-md">
            404
          </h1>
          <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">Signal Lost</h2>
          <p className="mt-3 text-slate-400 font-medium">
            The opportunity you're looking for doesn't exist on this node.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 px-8 py-3.5 text-sm font-bold text-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_5px_15px_rgba(147,51,234,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_20px_rgba(6,182,212,0.4)] active:translate-y-[2px] transition-all"
            >
              Return to Command Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#030712] text-slate-200 selection:bg-rose-500/30 overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-rose-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
      </div>
      <div className="w-full max-w-md relative z-10 text-center">
        <div className="rounded-[2rem] border border-rose-500/20 bg-slate-900/60 p-12 shadow-glass-strong backdrop-blur-xl">
          <h1 className="text-2xl font-black text-white tracking-tight">System Fault Detected</h1>
          <p className="mt-3 text-slate-400 font-medium">
            Something failed to execute on our end. Please recalibrate and try again.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_5px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_10px_20px_rgba(244,63,94,0.4)] active:translate-y-[2px] transition-all"
            >
              Recalibrate
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-slate-800 px-8 py-3.5 text-sm font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-slate-700 active:translate-y-[2px] transition-all"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KI Market Inventory — Waides KI arbitrage command center" },
      {
        name: "description",
        content:
          "Track P2P and arbitrage trades across Binance, Bybit, OKX. Konsmik Intelligence explains every opportunity. Tracking-only; no auto-execution.",
      },
      { name: "author", content: "Waides KI" },
      { property: "og:title", content: "KI Market Inventory" },
      {
        property: "og:description",
        content: "P2P & arbitrage command center powered by Konsmik Intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { LazyMotion } from "framer-motion";

const loadFeatures = () => import("framer-motion").then((res) => res.domAnimation);

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LazyMotion features={loadFeatures} strict>
          <Outlet />
        </LazyMotion>
        <Toaster theme="dark" richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
