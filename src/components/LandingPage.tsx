import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Search,
  TestTube,
  BarChart3,
  Bot,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Shield,
  Lock,
  Zap,
} from "lucide-react";
import { useRef } from "react";

const features = [
  {
    id: "scanner",
    icon: Search,
    title: "Opportunity Scanner",
    description: "Real-time P2P price comparison across top exchanges. Instantly spot the highest spreads.",
    image: "/features/scanner.png",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-500/20",
    size: "col-span-1 md:col-span-2 row-span-2",
  },
  {
    id: "trading",
    icon: TestTube,
    title: "Paper Trading",
    description: "Simulate trades without real money. Validate your strategies risk-free.",
    image: "/features/trading.png",
    color: "from-purple-400 to-pink-500",
    shadow: "shadow-purple-500/20",
    size: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Profit Analytics",
    description: "Deep dive into your daily, weekly, and monthly performance metrics.",
    image: "/features/analytics.png",
    color: "from-emerald-400 to-cyan-500",
    shadow: "shadow-emerald-500/20",
    size: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    id: "ki",
    icon: Bot,
    title: "KI Intelligence",
    description: "Chat with an AI trained specifically on market arbitrage and your personal trade history.",
    image: "/features/ki.png",
    color: "from-fuchsia-400 to-purple-600",
    shadow: "shadow-fuchsia-500/20",
    size: "col-span-1 md:col-span-2 row-span-1",
  },
  {
    id: "risk",
    icon: ShieldCheck,
    title: "Risk Management",
    description: "Track capital flow and isolate paper funds from real world profits.",
    image: "/features/risk.png",
    color: "from-rose-400 to-orange-500",
    shadow: "shadow-rose-500/20",
    size: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    id: "journal",
    icon: BookOpen,
    title: "Trade Journal",
    description: "Document lessons learned and emotional states during execution.",
    image: "/features/journal.png",
    color: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-500/20",
    size: "col-span-1 md:col-span-1 row-span-1",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    if (!loading && isAuthenticated) void navigate({ to: "/dashboard" });
  }, [isAuthenticated, loading, navigate]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030712] text-slate-200 selection:bg-cyan-500/30 font-sans overflow-hidden">
      
      {/* GLOBAL 3D LIGHTING & MESH BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-700/20 blur-[150px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* FLOATING NAVBAR */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-full border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] shadow-inner p-2 pl-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="font-bold text-white tracking-wide">KI Market</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <button className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Log In
            </button>
          </Link>
          <Link to="/auth">
            <button className="relative px-6 py-2 text-sm font-bold text-white bg-white/10 rounded-full border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_15px_rgba(0,0,0,0.5)] hover:bg-white/20 active:translate-y-[2px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all">
              Sign Up
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* 3D HERO SECTION */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 z-10 px-4 min-h-[90vh] flex flex-col items-center justify-center">
        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          className="max-w-5xl mx-auto text-center perspective-[1000px]"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 text-cyan-300 text-sm font-medium mb-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Tracking-only platform. Zero auto-execution.</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05] text-white drop-shadow-2xl"
          >
            Command Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-purple-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              Arbitrage Edge.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            The ultimate 3D intelligence dashboard for P2P traders. Track spreads, simulate risk-free, and analyze performance with KI.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/auth">
              <button className="group relative flex items-center justify-center px-10 py-5 text-lg font-bold text-black bg-gradient-to-b from-white to-slate-200 rounded-2xl border border-white/50 shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_10px_30px_rgba(255,255,255,0.2),0_20px_40px_rgba(6,182,212,0.2)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_15px_40px_rgba(255,255,255,0.3),0_25px_50px_rgba(6,182,212,0.3)] active:translate-y-[4px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_5px_15px_rgba(255,255,255,0.1)] transition-all duration-300">
                Launch Platform
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 3D BENTO BOX FEATURES GRID */}
      <section className="relative py-24 z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-lg">Platform Capabilities</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to find, track, and master arbitrage spreads.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[300px] gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 50, rotateX: 10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className={`relative group rounded-[2rem] overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_15px_35px_rgba(0,0,0,0.5)] ${feature.size} ${feature.shadow} hover:shadow-2xl transition-all duration-500 flex flex-col`}
                >
                  {/* Glassmorphic overlay */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-black/90 pointer-events-none" />
                  
                  {/* Dynamic Image Background with 3D Parallax feel */}
                  <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
                    <img 
                      src={feature.image} 
                      alt={feature.title} 
                      className="w-full h-full object-cover object-top opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-500" />
                  </div>

                  {/* Content */}
                  <div className="relative z-20 mt-auto p-8 flex flex-col items-start">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg shadow-black/50 mb-4 border border-white/20`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight drop-shadow-md">{feature.title}</h3>
                    <p className="text-slate-300 font-medium leading-relaxed drop-shadow-sm max-w-md">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3D SECURITY SECTION */}
      <section className="relative py-32 z-10 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 md:p-20 text-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_30px_60px_rgba(0,0,0,0.6)]"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-b from-slate-800 to-black rounded-3xl border border-slate-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
              <Lock className="w-10 h-10 text-blue-400 relative z-10" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Fort Knox Security</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              Your API keys are encrypted at rest. We request strictly read-only access. The platform physically cannot withdraw or execute trades.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                { title: "AES-256 Encryption", desc: "Military grade database encryption for all stored configurations.", color: "text-blue-400" },
                { title: "Isolated Environments", desc: "Paper trading simulations are walled off from your real portfolio.", color: "text-cyan-400" }
              ].map((item, i) => (
                <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-inner">
                  <h3 className={`text-lg font-bold ${item.color} mb-2`}>{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="relative py-32 z-10 px-4 border-t border-white/5 bg-black/50 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Start Tracking Today.</h2>
          <Link to="/auth">
            <button className="group relative flex items-center justify-center px-12 py-6 mx-auto text-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_30px_rgba(147,51,234,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_15px_40px_rgba(6,182,212,0.4)] active:translate-y-[4px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_5px_15px_rgba(0,0,0,0.5)] transition-all duration-300">
              Create Your Command Center
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
