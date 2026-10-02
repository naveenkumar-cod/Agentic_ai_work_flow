import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import {
  Sparkles,
  Loader2,
  GitFork,
  Wand2,
  Play,
  RotateCcw
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  'When a new customer email arrives in Gmail, analyze sentiment with AI, append to Google Sheets, and post a Slack alert if negative.',
  'On daily 9am schedule, search invoice emails, extract total due with AI, and append to Google Sheets.',
  'Trigger on incoming webhook payload, classify intent with AI, and post announcement to Discord channel.',
  'On manual trigger, analyze user feedback text, filter if urgent, and send confirmation email via Gmail.'
];

export default function AIWorkflowBuilderPage() {
  const router = useRouter();
  const { setWorkflow, setNodes, setEdges } = useWorkflowStore();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGraph, setGeneratedGraph] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (selectedPrompt) => {
    const promptToUse = selectedPrompt || prompt;
    if (!promptToUse.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await api.post('/workflows/generate', { prompt: promptToUse });
      const graph = res.data;
      setGeneratedGraph(graph);

      setWorkflow(graph);
      setNodes(graph.nodes || []);
      setEdges(graph.edges || []);
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndOpen = async (shouldRunImmediately = false) => {
    if (!generatedGraph) return;

    setIsSaving(true);
    try {
      const res = await api.post('/workflows', {
        name: generatedGraph.name || 'AI Generated Automation',
        description: generatedGraph.description || `Generated from prompt: "${prompt}"`,
        triggerConfig: generatedGraph.triggerConfig || { type: 'manual' },
        nodes: generatedGraph.nodes || [],
        edges: generatedGraph.edges || [],
        tags: ['ai-generated']
      });

      const newWorkflow = res.data;

      if (shouldRunImmediately) {
        const execRes = await api.post(`/workflows/${newWorkflow._id}/execute`, {
          inputs: { promptSource: prompt }
        });
        router.push(`/executions/${execRes.data._id}`);
      } else {
        router.push(`/workflows/${newWorkflow._id}`);
      }
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          <div className="p-4 lg:p-6 bg-white dark:bg-[#0c1220] border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 z-20 transition-colors duration-150">
            <div>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">AI Workflow Architect</h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Describe an operations pipeline in natural language to generate a visual graph.
              </p>
            </div>

            {generatedGraph && (
              <div className="flex items-center space-x-3 w-full lg:w-auto justify-end">
                <button
                  onClick={() => setGeneratedGraph(null)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={() => handleSaveAndOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold border border-slate-300 dark:border-slate-700 shadow-sm flex items-center space-x-1.5 transition-colors"
                >
                  <GitFork className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Open in Canvas Editor</span>
                </button>

                <button
                  onClick={() => handleSaveAndOpen(true)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-colors"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>Save & Run Now</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="w-full lg:w-96 bg-white dark:bg-[#0d1424] border-r border-slate-200 dark:border-slate-800 p-5 overflow-y-auto space-y-5 flex flex-col justify-between transition-colors duration-150">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Describe your automation
                  </label>
                  <textarea
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. When a new customer email arrives in Gmail, analyze sentiment with AI, append to Google Sheets, and alert the Slack operations channel..."
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans shadow-inner resize-none transition-colors"
                  />
                </div>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white text-xs font-semibold shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating graph nodes & edges...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Workflow Graph</span>
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                    {error}
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Example Templates:
                  </span>
                  <div className="space-y-2">
                    {SAMPLE_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPrompt(p);
                          handleGenerate(p);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {generatedGraph && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Engine:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold text-[10px]">
                      {generatedGraph.generatorEngine || 'AI Generator'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Structure:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">
                      {generatedGraph.nodes?.length || 0} Nodes, {generatedGraph.edges?.length || 0} Edges
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-[#090d16] relative flex flex-col h-full transition-colors duration-150">
              {!generatedGraph ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xl shadow-indigo-500/10">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Interactive Canvas Preview</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Type a prompt on the left or select an example template to generate and inspect the workflow graph.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 h-full w-full">
                  <WorkflowCanvas readOnly={false} />
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
