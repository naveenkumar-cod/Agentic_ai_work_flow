import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import {
  GitFork,
  Sparkles,
  Plus,
  Play,
  Copy,
  Trash2,
  Search,
  Loader2,
  Layers
} from 'lucide-react';

export default function WorkflowsListPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows', {
        params: { search, status: statusFilter }
      });
      setWorkflows(res.data || []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkflows();
    }
  }, [isAuthenticated, search, statusFilter]);

  const handleExecute = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setActionLoadingId(id);
      const res = await api.post(`/workflows/${id}/execute`, { inputs: { source: 'manual_list_trigger' } });
      router.push(`/executions/${res.data._id}`);
    } catch (err) {
      alert(`Execution trigger failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const handleDelete = async (id, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete workflow "${name}"?`)) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleCreateEmpty = async () => {
    try {
      const res = await api.post('/workflows', {
        name: 'New Custom Automation',
        description: 'Visual workflow created manually',
        nodes: [
          {
            id: 'node_1',
            type: 'trigger',
            position: { x: 280, y: 150 },
            data: {
              id: 'node_1',
              label: 'Manual Trigger',
              nodeType: 'trigger',
              description: 'Trigger on button click or schedule',
              config: { triggerType: 'manual' }
            }
          }
        ],
        edges: []
      });
      router.push(`/workflows/${res.data._id}`);
    } catch (err) {
      alert(`Create failed: ${err.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workflows Library</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage, edit, duplicate, and execute your visual multi-agent workflows.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateEmpty}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-colors flex items-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Blank Canvas</span>
              </button>

              <Link
                href="/workflows/builder"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Prompt Builder</span>
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between transition-colors duration-150">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search workflows by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading workflows...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
              <GitFork className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No workflows found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Generate an automation with our natural language AI generator or start from a blank canvas.
              </p>
              <div className="pt-2">
                <Link
                  href="/workflows/builder"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Build with AI Prompt</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflows.map((wf) => (
                <div
                  key={wf._id}
                  onClick={() => router.push(`/workflows/${wf._id}`)}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 shadow-md shadow-slate-900/5 dark:shadow-none hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 uppercase">
                        v{wf.version || 1}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          wf.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {wf.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {wf.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {wf.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                      <span className="flex items-center">
                        <Layers className="w-3.5 h-3.5 mr-1 text-slate-500 dark:text-slate-400" />
                        {wf.nodes?.length || 0} nodes
                      </span>
                      <span>&bull;</span>
                      <span>Trigger: {wf.triggerConfig?.type || 'manual'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={(e) => handleExecute(wf._id, e)}
                      disabled={actionLoadingId === wf._id}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold transition-colors flex items-center space-x-1.5"
                    >
                      {actionLoadingId === wf._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>Run Now</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleDuplicate(wf._id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(wf._id, wf.name, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
