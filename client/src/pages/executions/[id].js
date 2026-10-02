import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { getSocket, joinExecutionRoom } from '../../services/socket';
import {
  Play,
  Pause,
  XCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowLeft,
  Bot,
  Brain,
  ShieldCheck,
  LifeBuoy,
  Activity,
  Layers,
  ChevronRight,
  Code,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const AGENT_META = {
  planner: {
    label: 'Planner Agent',
    icon: Brain,
    badge: 'border-purple-200 dark:border-purple-500/40 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'
  },
  execution: {
    label: 'Execution Agent',
    icon: Bot,
    badge: 'border-blue-200 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
  },
  validation: {
    label: 'Validation Agent',
    icon: ShieldCheck,
    badge: 'border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
  },
  recovery: {
    label: 'Recovery Agent',
    icon: LifeBuoy,
    badge: 'border-amber-200 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
  },
  monitoring: {
    label: 'Monitoring Agent',
    icon: Activity,
    badge: 'border-cyan-200 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400'
  }
};

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuthStore();

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  const timelineEndRef = useRef(null);

  const fetchExecutionData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [execRes, logsRes] = await Promise.all([
        api.get(`/executions/${id}`),
        api.get(`/executions/${id}/timeline`)
      ]);
      setExecution(execRes.data);
      setLogs(logsRes.data || []);
      if (logsRes.data?.length > 0) {
        setSelectedLog(logsRes.data[logsRes.data.length - 1]);
      }
    } catch (err) {
      console.error('Failed to load execution run:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    fetchExecutionData();

    if (id) {
      joinExecutionRoom(id);
      const socket = getSocket();

      if (socket) {
        const handleAgentEvent = (event) => {
          setLogs((prev) => {
            const exists = prev.some((l) => l._id === event.logId);
            if (exists) return prev;
            const newLog = {
              _id: event.logId || Math.random().toString(),
              agent: event.agent,
              level: event.level,
              message: event.message,
              metadata: event.metadata,
              nodeId: event.nodeId,
              timestamp: event.timestamp
            };
            setSelectedLog(newLog);
            return [...prev, newLog];
          });
        };

        const handleStatusUpdate = (statusData) => {
          setExecution((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: statusData.status,
              duration: statusData.duration || prev.duration,
              endTime: statusData.endTime || prev.endTime,
              outputs: statusData.outputs || prev.outputs,
              error: statusData.error || prev.error
            };
          });
        };

        socket.on('agent_event', handleAgentEvent);
        socket.on('execution_status', handleStatusUpdate);

        return () => {
          socket.off('agent_event', handleAgentEvent);
          socket.off('execution_status', handleStatusUpdate);
        };
      }
    }
  }, [id]);

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  const handlePause = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/executions/${id}/pause`);
      setExecution(res.data);
    } catch (err) {
      alert(`Pause failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/executions/${id}/resume`);
      setExecution(res.data);
    } catch (err) {
      alert(`Resume failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this execution run?')) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/executions/${id}/cancel`);
      setExecution(res.data);
    } catch (err) {
      alert(`Cancel failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Completed
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Running
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Failed
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Paused
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-xs">Loading execution timeline...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          <div className="p-4 lg:px-6 bg-white dark:bg-[#0c1220] border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-20 transition-colors duration-150">
            <div className="flex items-center space-x-3">
              <Link
                href="/executions"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Back to executions"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-base font-bold text-slate-900 dark:text-white">
                    {execution?.workflowId?.name || execution?.workflowSnapshot?.name || 'Execution Run'}
                  </h1>
                  {getStatusBadge(execution?.status)}
                  <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50">
                    Substrate: LangGraph
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>ID: <span className="font-mono text-slate-700 dark:text-slate-300">{execution?._id}</span></span>
                  <span>&bull;</span>
                  <span>Duration: <span className="font-mono text-slate-700 dark:text-slate-300">{execution?.duration ? `${(execution.duration / 1000).toFixed(2)}s` : 'active'}</span></span>
                  <span>&bull;</span>
                  <span>Plan Confidence: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{((execution?.planConfidence || 0.98) * 100).toFixed(0)}%</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 self-end sm:self-auto">
              {execution?.status === 'RUNNING' && (
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              {execution?.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              )}

              {['PENDING', 'RUNNING', 'PAUSED', 'RETRYING'].includes(execution?.status) && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-700/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Run</span>
                </button>
              )}

              <Link
                href={`/workflows/${execution?.workflowId?._id || execution?.workflowId}`}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <span>Edit Workflow</span>
              </Link>
            </div>
          </div>

          <div className="h-11 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 px-6 flex items-center space-x-6 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors duration-150">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`h-full border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'timeline'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-white'
                  : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Multi-Agent Live Timeline ({logs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('outputs')}
              className={`h-full border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'outputs'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-white'
                  : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Outputs & Step Data</span>
            </button>
            <button
              onClick={() => setActiveTab('snapshot')}
              className={`h-full border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'snapshot'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-white'
                  : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Workflow Snapshot</span>
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'timeline' && (
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-slate-50 dark:bg-[#090d16] transition-colors duration-150">
                  {logs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                      No logs emitted yet. Starting orchestrator agent chain...
                    </div>
                  ) : (
                    logs.map((log, index) => {
                      const agentConf = AGENT_META[log.agent] || AGENT_META.monitoring;
                      const Icon = agentConf.icon;
                      const isSelected = selectedLog?._id === log._id;

                      return (
                        <div
                          key={log._id || index}
                          onClick={() => setSelectedLog(log)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 group ${
                            isSelected
                              ? 'bg-white dark:bg-slate-900/90 border-indigo-500 shadow-lg shadow-indigo-500/10'
                              : 'bg-white dark:bg-[#0f172a]/70 hover:bg-slate-50 dark:hover:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-sm'
                          }`}
                        >
                          <div className={`p-2 rounded-xl border ${agentConf.badge} shrink-0 mt-0.5`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded uppercase ${agentConf.badge}`}>
                                  {agentConf.label}
                                </span>
                                {log.nodeId && (
                                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    Node: {log.nodeId}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>

                            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                              {log.message}
                            </p>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 shrink-0 self-center" />
                        </div>
                      );
                    })
                  )}
                  <div ref={timelineEndRef} />
                </div>

                <div className="w-full lg:w-96 bg-white dark:bg-[#0c1220] border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-5 overflow-y-auto space-y-4 transition-colors duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Step Inspector
                    </span>
                    {selectedLog && (
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold">
                        {selectedLog.agent} Agent
                      </span>
                    )}
                  </div>

                  {selectedLog ? (
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Message Description</label>
                        <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                          {selectedLog.message}
                        </p>
                      </div>

                      {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Event Metadata & Payload</label>
                          <pre className="p-3.5 bg-slate-900 dark:bg-[#070a12] rounded-xl border border-slate-200 dark:border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-80 shadow-inner">
                            {JSON.stringify(selectedLog.metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="pt-2 text-[10px] text-slate-500 space-y-1">
                        <div>Log ID: <span className="font-mono text-slate-600 dark:text-slate-400">{selectedLog._id}</span></div>
                        <div>Level: <span className="uppercase text-slate-600 dark:text-slate-400">{selectedLog.level}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-xs text-slate-400 dark:text-slate-500">
                      Select a log item to inspect detailed step telemetry.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'outputs' && (
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-[#090d16] space-y-4 transition-colors duration-150">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Execution Outputs & Node Results</h3>
                <pre className="p-5 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed shadow-lg shadow-slate-900/5">
                  {JSON.stringify(execution?.outputs || {}, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === 'snapshot' && (
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-[#090d16] space-y-4 transition-colors duration-150">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Immutable Runtime Workflow Snapshot</h3>
                <pre className="p-5 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed shadow-lg shadow-slate-900/5">
                  {JSON.stringify(execution?.workflowSnapshot || {}, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
