import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import NodePalette from '../../components/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import {
  Save,
  Play,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuthStore();
  const {
    workflow,
    fetchWorkflow,
    saveWorkflow,
    isDirty,
    isSaving,
    isLoading
  } = useWorkflowStore();

  const [workflowName, setWorkflowName] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [triggerInputJson, setTriggerInputJson] = useState('{\n  "source": "manual_canvas_test",\n  "customerEmail": "customer@acme.com",\n  "feedbackText": "The new agent pipeline is fast and reliable!"\n}');

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchWorkflow(id).then((wf) => {
        if (wf) setWorkflowName(wf.name || 'Untitled Workflow');
      });
    }
  }, [id, isAuthenticated, fetchWorkflow]);

  const handleSave = async () => {
    try {
      await saveWorkflow();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleRunExecution = async () => {
    if (!id) return;
    setIsRunning(true);
    try {
      let parsedInputs = {};
      try {
        parsedInputs = JSON.parse(triggerInputJson);
      } catch (_) {
        parsedInputs = { raw: triggerInputJson };
      }

      if (isDirty) {
        await saveWorkflow();
      }

      const res = await api.post(`/workflows/${id}/execute`, { inputs: parsedInputs });
      router.push(`/executions/${res.data._id}`);
    } catch (err) {
      alert(`Execution trigger failed: ${err.message}`);
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-xs">Loading workflow canvas...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          <div className="h-14 bg-white dark:bg-[#0d1424] border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-20 transition-colors duration-150">
            <div className="flex items-center space-x-3">
              <Link
                href="/workflows"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Back to workflows"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  onBlur={() => {
                    if (workflow) workflow.name = workflowName;
                  }}
                  className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-sm font-bold text-slate-900 dark:text-white transition-colors focus:outline-none"
                />
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 uppercase">
                  v{workflow?.version || 1}
                </span>
                {isDirty && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  isDirty
                    ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-indigo-300 dark:border-indigo-500/40 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                )}
                <span>{isSaving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}</span>
              </button>

              <button
                onClick={() => setIsRunModalOpen(true)}
                disabled={isRunning}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
              >
                {isRunning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Run Workflow</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden relative">
            <NodePalette />
            <div className="flex-1 h-full bg-slate-50 dark:bg-[#090d16] relative transition-colors duration-150">
              <WorkflowCanvas readOnly={false} />
            </div>
            <NodeConfigPanel />
          </div>

          {isRunModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Trigger Workflow Execution</h3>
                  </div>
                  <button
                    onClick={() => setIsRunModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Payload Inputs (JSON format passed to trigger):
                  </label>
                  <textarea
                    rows={6}
                    value={triggerInputJson}
                    onChange={(e) => setTriggerInputJson(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-[11px] text-indigo-700 dark:text-indigo-300">
                  <span>5-Agent Execution Chain: Planner &rarr; Executor &rarr; Validator &rarr; Recovery &rarr; Monitoring</span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setIsRunModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRunExecution}
                    disabled={isRunning}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
                  >
                    {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>Start Execution</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
