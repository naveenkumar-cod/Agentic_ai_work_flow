import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import ThemeSelector from '../components/ThemeSelector';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import {
  ShieldCheck,
  User,
  Activity,
  Lock,
  Palette,
  Server
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoadingHealth(true);
      const res = await api.get('/health');
      setHealth(res);
    } catch (_) {
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchHealth();
  }, [isAuthenticated]);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">System Settings & Security</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage operator credentials, encryption status, and multi-agent runtime configuration.
            </p>
          </div>

          <div className="space-y-6">
            {/* Operator Profile */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl shadow-slate-900/5 dark:shadow-black/60 transition-colors duration-150">
              <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Operator Profile</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Full Name</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold">
                    {user?.name || 'Platform Operator'}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Email Address</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono">
                    {user?.email || 'operator@agentflow.ai'}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Assigned Role</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-mono uppercase font-bold">
                    {user?.role || 'operator'}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Auth Scheme</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    JWT Session (Bcrypt Cost Factor 12)
                  </div>
                </div>
              </div>
            </div>

            {/* Interface & Aesthetics / Theme System */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl shadow-slate-900/5 dark:shadow-black/60 transition-colors duration-150">
              <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Interface & Aesthetics</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Choose between Light, Dark, or System Default appearance.</p>
                </div>
              </div>

              <div className="pt-2">
                <ThemeSelector variant="settings" />
              </div>
            </div>

            {/* Security & Infrastructure Health */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl shadow-slate-900/5 dark:shadow-black/60 transition-colors duration-150">
              <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Encryption & Credential Health</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">AES-256-GCM Token Encryption</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">All OAuth credentials encrypted with 32-byte key at rest.</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-bold">
                    ACTIVE
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Multi-Agent Orchestrator Substrate</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">LangGraph / LangChain orchestration layer integration.</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 text-[11px] font-mono font-bold">
                    {health?.langGraph || 'AVAILABLE'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Execution Background Queue</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">BullMQ on Redis with automated in-memory worker fallback.</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50 text-[11px] font-mono font-bold">
                    {health?.queueEngine || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
