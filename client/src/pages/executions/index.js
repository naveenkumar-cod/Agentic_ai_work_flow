import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Filter,
  Loader2,
  GitFork
} from 'lucide-react';

export default function ExecutionsListPage() {
  const { isAuthenticated } = useAuthStore();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/executions', {
        params: { status: statusFilter }
      });
      setExecutions(res.data || []);
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchExecutions();

    const socket = getSocket();
    if (socket) {
      const handleStatusUpdate = (update) => {
        setExecutions((prev) =>
          prev.map((item) =>
            item._id === update.executionId
              ? { ...item, status: update.status, duration: update.duration || item.duration }
              : item
          )
        );
      };

      socket.on('execution_status', handleStatusUpdate);
      socket.on('global_execution_update', () => fetchExecutions());

      return () => {
        socket.off('execution_status', handleStatusUpdate);
      };
    }
  }, [isAuthenticated, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 animate-pulse">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Running
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </span>
        );
      case 'RETRYING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 animate-pulse">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Retrying Backoff
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
            <AlertTriangle className="w-3 h-3 mr-1" /> Paused
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Cancelled
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
        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Execution Audit Runs</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Full timeline trace of all multi-agent automated executions.
              </p>
            </div>

            <button
              onClick={fetchExecutions}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm transition-colors self-start sm:self-auto flex items-center space-x-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Runs</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-150">
            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-slate-400 dark:text-slate-400" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">Status Filter:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Executions</option>
              <option value="COMPLETED">Completed</option>
              <option value="RUNNING">Running</option>
              <option value="FAILED">Failed</option>
              <option value="PAUSED">Paused</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-900/5 dark:shadow-xl overflow-hidden transition-colors duration-150">
            {loading ? (
              <div className="p-16 text-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Loading execution audit log...</p>
              </div>
            ) : executions.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <PlayCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No execution runs recorded</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Trigger an automation from the workflows library to view its live execution stream here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#0b101d] text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-5">Workflow</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Orchestrator</th>
                      <th className="py-3.5 px-4">Started At</th>
                      <th className="py-3.5 px-5 text-right">Audit Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                    {executions.map((exec) => (
                      <tr
                        key={exec._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => window.location.href = `/executions/${exec._id}`}
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                              <GitFork className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                                {exec.workflowId?.name || exec.workflowSnapshot?.name || 'Automation Pipeline'}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                                ID: {exec._id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">{getStatusBadge(exec.status)}</td>

                        <td className="py-4 px-4 font-mono text-slate-700 dark:text-slate-300">
                          {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : '—'}
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                            LangGraph {exec.langGraph || 'available'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(exec.createdAt).toLocaleString()}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <Link
                            href={`/executions/${exec._id}`}
                            className="inline-flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold group-hover:translate-x-1 transition-transform"
                          >
                            <span>Inspect Timeline</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
