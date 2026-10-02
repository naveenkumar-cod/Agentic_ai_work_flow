import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import ThemeSelector from '../components/ThemeSelector';
import {
  Sparkles,
  ArrowRight,
  Bot,
  ShieldCheck,
  Activity,
  Workflow
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const agents = [
    { name: 'Planner Agent', desc: 'Topological DAG ordering, dependency analysis & confidence scoring', color: 'border-purple-200 dark:border-purple-500/40 bg-purple-50/70 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400' },
    { name: 'Execution Agent', desc: 'Dispatches actions to Gmail, Slack, Discord, Sheets & AI providers', color: 'border-blue-200 dark:border-blue-500/40 bg-blue-50/70 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400' },
    { name: 'Validation Agent', desc: 'Output schema verification and required-field contract enforcement', color: 'border-emerald-200 dark:border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' },
    { name: 'Recovery Agent', desc: 'Error classification, exponential retry backoff & automated escalation', color: 'border-amber-200 dark:border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400' },
    { name: 'Monitoring Agent', desc: 'Real-time WebSocket event streaming and persistent audit logging', color: 'border-cyan-200 dark:border-cyan-500/40 bg-cyan-50/70 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      <header className="h-20 border-b border-slate-200 dark:border-slate-800/80 px-6 lg:px-12 flex items-center justify-between backdrop-blur-md bg-white/80 dark:bg-[#090d16]/80 sticky top-0 z-50 transition-colors duration-150">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-600 dark:from-white dark:via-indigo-100 dark:to-indigo-400">
            Agentflow<span className="text-indigo-600 dark:text-indigo-400">_AI</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeSelector variant="compact" />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2"
          >
            Operator Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium backdrop-blur-sm animate-pulse">
          <Bot className="w-3.5 h-3.5" />
          <span>Next-Generation Multi-Agent Operations Automation Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Turn natural language prompts into <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-400">
            executable visual workflows
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Describe an automation in plain English. Watch our 5-agent AI chain assemble the React Flow graph, execute steps with real OAuth integrations, handle automated retries, and stream audit timelines in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/workflows/builder"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 group"
          >
            <Sparkles className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
            <span>Launch AI Workflow Builder</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600"
          >
            Access Operator Console
          </Link>
        </div>

        <div className="w-full pt-16 text-left">
          <div className="text-center mb-8">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">The Multi-Agent Core</h2>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">5 Specialized Agents Cooperating in Real Time</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {agents.map((ag, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border ${ag.color} backdrop-blur-md shadow-sm transition-all hover:translate-y-[-2px] flex flex-col justify-between`}
              >
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider mb-2 opacity-80">
                    Agent 0{i + 1}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">{ag.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ag.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12 text-left">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-900/5 dark:shadow-none space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Workflow className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-base text-slate-900 dark:text-white">Visual React Flow Canvas</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Drag-and-drop node palette, animated edges, dynamic property configuration panel, and graph version history.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-900/5 dark:shadow-none space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-base text-slate-900 dark:text-white">AES-256 OAuth Integrations</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Native integration with Gmail, Slack, Discord, and Google Sheets with credentials securely encrypted at rest.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-900/5 dark:shadow-none space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-base text-slate-900 dark:text-white">Live Socket Event Streaming</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time timeline broadcasts for every planner, execution, validation, recovery, and monitoring event.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-500">
        Agentic AI Automation Platform (Agentflow_AI) &bull; Built with Next.js, Express, LangGraph, React Flow, and Socket.IO.
      </footer>
    </div>
  );
}
