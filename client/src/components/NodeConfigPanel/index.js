import React from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Sliders, Trash2, X } from 'lucide-react';

export default function NodeConfigPanel() {
  const { selectedNode, updateNodeData, deleteNode, selectNode } = useWorkflowStore();

  if (!selectedNode) {
    return null;
  }

  const nodeType = selectedNode.type || selectedNode.data?.nodeType || 'transform';
  const data = selectedNode.data || {};
  const config = data.config || {};

  const handleConfigChange = (key, value) => {
    updateNodeData(selectedNode.id, {
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  const handleLabelChange = (e) => {
    updateNodeData(selectedNode.id, { label: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    updateNodeData(selectedNode.id, { description: e.target.value });
  };

  return (
    <div className="w-80 bg-white dark:bg-[#0d1424] border-l border-slate-200 dark:border-slate-800 flex flex-col h-full z-10 shadow-2xl transition-colors duration-150">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Node Configuration</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => deleteNode(selectedNode.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => selectNode(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div className="space-y-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Node ID</label>
            <span className="font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 block truncate">
              {selectedNode.id}
            </span>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Display Label</label>
            <input
              type="text"
              value={data.label || ''}
              onChange={handleLabelChange}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Description</label>
            <input
              type="text"
              placeholder="What does this step do?"
              value={data.description || ''}
              onChange={handleDescriptionChange}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Parameters & Logic
            </span>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold">{nodeType}</span>
          </div>

          {nodeType === 'trigger' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Trigger Method</label>
                <select
                  value={config.triggerType || 'manual'}
                  onChange={(e) => handleConfigChange('triggerType', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="manual">Manual On-Demand</option>
                  <option value="webhook">Incoming HTTP Webhook</option>
                  <option value="schedule">Cron Schedule</option>
                </select>
              </div>
            </div>
          )}

          {(nodeType === 'ai_prompt' || nodeType === 'ai') && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">AI Model Engine</label>
                <select
                  value={config.model || 'gpt-4o'}
                  onChange={(e) => handleConfigChange('model', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="gpt-4o">OpenRouter: Claude 3.5 Sonnet / GPT-4o</option>
                  <option value="gemini-1.5-flash">Google: Gemini 1.5 Flash</option>
                  <option value="gemini-2.0-flash">Google: Gemini 2.0 Flash</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Prompt Instructions</label>
                <textarea
                  rows={5}
                  value={config.prompt || ''}
                  onChange={(e) => handleConfigChange('prompt', e.target.value)}
                  placeholder="Evaluate sentiment and extract key action items as JSON..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed"
                />
              </div>
            </div>
          )}

          {nodeType === 'slack' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Target Channel</label>
                <input
                  type="text"
                  value={config.channel || ''}
                  onChange={(e) => handleConfigChange('channel', e.target.value)}
                  placeholder="#ai-alerts"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Alert Message</label>
                <textarea
                  rows={4}
                  value={config.message || ''}
                  onChange={(e) => handleConfigChange('message', e.target.value)}
                  placeholder="🚨 Notification from Agentflow..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px]"
                />
              </div>
            </div>
          )}

          {nodeType === 'gmail' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={config.to || ''}
                  onChange={(e) => handleConfigChange('to', e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Email Subject</label>
                <input
                  type="text"
                  value={config.subject || ''}
                  onChange={(e) => handleConfigChange('subject', e.target.value)}
                  placeholder="Pipeline Notification"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {(nodeType === 'google_sheets' || nodeType === 'google-sheets') && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Spreadsheet ID</label>
                <input
                  type="text"
                  value={config.spreadsheetId || ''}
                  onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Sheet Name</label>
                <input
                  type="text"
                  value={config.sheetName || 'Sheet1'}
                  onChange={(e) => handleConfigChange('sheetName', e.target.value)}
                  placeholder="Sheet1"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {nodeType === 'discord' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Channel Name or ID</label>
                <input
                  type="text"
                  value={config.channel || ''}
                  onChange={(e) => handleConfigChange('channel', e.target.value)}
                  placeholder="announcements"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Broadcast Message</label>
                <textarea
                  rows={3}
                  value={config.message || ''}
                  onChange={(e) => handleConfigChange('message', e.target.value)}
                  placeholder="Discord webhook announcement..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px]"
                />
              </div>
            </div>
          )}

          {nodeType === 'condition' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Field to Compare</label>
                <input
                  type="text"
                  value={config.field || 'status'}
                  onChange={(e) => handleConfigChange('field', e.target.value)}
                  placeholder="status"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Comparison Operator</label>
                <select
                  value={config.operator || 'equals'}
                  onChange={(e) => handleConfigChange('operator', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="equals">Equals (==)</option>
                  <option value="contains">Contains Substring</option>
                  <option value="greater">Greater Than (&gt;)</option>
                  <option value="less">Less Than (&lt;)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Target Value</label>
                <input
                  type="text"
                  value={config.value || 'approved'}
                  onChange={(e) => handleConfigChange('value', e.target.value)}
                  placeholder="approved"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
