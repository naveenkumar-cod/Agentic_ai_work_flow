import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import ThemeSelector from '../components/ThemeSelector';
import { Sparkles, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('operator@agentflow.ai');
  const [password, setPassword] = useState('operator123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      const redirectPath = router.query.redirect ? decodeURIComponent(router.query.redirect) : '/dashboard';
      router.push(redirectPath);
    } catch (_) {}
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500 selection:text-white relative transition-colors duration-150">
      {/* Top Bar Theme Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeSelector variant="compact" />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
              Agentflow<span className="text-indigo-600 dark:text-indigo-400">_AI</span>
            </span>
          </Link>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Operator Sign In</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Enter your credentials to access the AI operations console</p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/10 dark:shadow-black/80 space-y-5 backdrop-blur-xl transition-colors duration-150">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center space-x-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@agentflow.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">Need a quick demo login?</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('operator@agentflow.ai', 'operator123')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-indigo-700 dark:text-indigo-300 font-mono transition-colors"
              >
                Fill Operator Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@agentflow.ai', 'admin12345')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-purple-700 dark:text-purple-300 font-mono transition-colors"
              >
                Fill Admin Demo
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Do not have an operator account yet?{' '}
          <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold underline underline-offset-2">
            Register Account
          </Link>
        </p>
      </div>
    </div>
  );
}
