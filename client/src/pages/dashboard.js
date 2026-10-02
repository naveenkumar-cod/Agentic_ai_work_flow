import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import MetricGrid from '../components/MetricGrid';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { getSocket } from '../services/socket';
import {
  Sparkles,
  GitFork,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Bot
} from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDashboardData();

    const socket = getSocket();
    if (socket) {
      const handleGlobalEvent = (evt) => {
        setLiveEvents((prev) => [evt, ...prev.slice(0, 7)]);
      };

      socket.on('global_execution_update', handleGlobalEvent);
      return () => {
        socket.off('global_execution_update', handleGlobalEvent);
      };
    }
  }, [isAuthenticated]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 animate-pulse">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Running
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
            <AlertTriangle className="w-3 h-3 mr-1" /> Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Operations Command Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Monitor agentic execution pipelines, active workflows, and system health in real time.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDashboardData}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-colors"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <Link
                href="/workflows/builder"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New AI Workflow</span>
              </Link>
            </div>
          </div>

          <MetricGrid metrics={data?.metrics || {}} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PlayCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Execution Runs</h3>
                </div>
                <Link
                  href="/executions"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium flex items-center space-x-1"
                >
                  <span>View all executions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-lg shadow-slate-900/5 dark:shadow-xl transition-colors duration-150">
                {!data?.recentExecutions || data.recentExecutions.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <PlayCircle className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No execution runs recorded yet.</p>
                    <Link
                      href="/workflows/builder"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-xs font-medium border border-indigo-200 dark:border-indigo-500/30"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate and run your first workflow</span>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {data.recentExecutions.map((exec) => (
                      <Link
                        key={exec._id}
                        href={`/executions/${exec._id}`}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between group block"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:border-indigo-500/50 transition-colors">
                            <GitFork className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                              {exec.workflowId?.name || exec.workflowSnapshot?.name || 'Automated Pipeline'}
                            </h4>
                            <div className="flex items-center space-x-3 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {exec.duration ? `${(exec.duration / 1000).toFixed(1)}s` : 'In progress'}
                              </span>
                              <span>&bull;</span>
                              <span>{new Date(exec.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {getStatusBadge(exec.status)}
                          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Live Multi-Agent Activity</h3>
                </div>
                <span className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping mr-1.5" />
                  WebSocket
                </span>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 p-4 shadow-lg shadow-slate-900/5 dark:shadow-xl space-y-3 transition-colors duration-150">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time events emitted across Planner, Execution, Validation, Recovery, and Monitoring agents.
                </p>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                  {liveEvents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                      <Bot className="w-6 h-6 mx-auto text-slate-400 dark:text-slate-600" />
                      <p>Waiting for agent pipeline events...</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-600">Trigger any workflow to see live streaming logs.</p>
                    </div>
                  ) : (
                    liveEvents.map((evt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs space-y-1 animate-fadeIn"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400">
                            {evt.agent || 'SYSTEM'}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono">
                            {new Date(evt.timestamp || Date.now()).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-sans leading-relaxed">{evt.message || 'Execution status changed'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
