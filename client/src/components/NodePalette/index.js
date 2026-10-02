import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  Mail,
  MessageSquare,
  MessageCircle,
  Table,
  GitBranch,
  Cpu,
  Search,
  GripVertical
} from 'lucide-react';

const PALETTE_CATEGORIES = [
  {
    category: 'Triggers',
    items: [
      {
        type: 'trigger',
        label: 'Manual Trigger',
        description: 'Run on-demand or test invoke',
        icon: Zap,
        color: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/20'
      },
      {
        type: 'trigger',
        label: 'Webhook Trigger',
        description: 'Trigger on incoming HTTP POST',
        icon: Zap,
        color: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/20',
        defaultConfig: { triggerType: 'webhook' }
      }
    ]
  },
  {
    category: 'AI & Processing',
    items: [
      {
        type: 'ai_prompt',
        label: 'AI Reasoning & LLM',
        description: 'OpenRouter / Gemini intelligence',
        icon: Sparkles,
        color: 'text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/20',
        defaultConfig: { prompt: 'Analyze and extract key information from input data.', model: 'gemini-1.5-flash' }
      },
      {
        type: 'transform',
        label: 'Data Transform',
        description: 'Format, map, and structure JSON',
        icon: Cpu,
        color: 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-950/20'
      },
      {
        type: 'condition',
        label: 'Conditional Filter',
        description: 'Branch based on value evaluation',
        icon: GitBranch,
        color: 'text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-500/40 bg-orange-50 dark:bg-orange-950/20',
        defaultConfig: { field: 'status', operator: 'equals', value: 'approved' }
      }
    ]
  },
  {
    category: 'Integrations & Actions',
    items: [
      {
        type: 'gmail',
        label: 'Gmail',
        description: 'Send or query emails via OAuth',
        icon: Mail,
        color: 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/20',
        defaultConfig: { action: 'send_email', to: 'operator@example.com', subject: 'Automated Update' }
      },
      {
        type: 'slack',
        label: 'Slack',
        description: 'Post messages & alert channels',
        icon: MessageSquare,
        color: 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20',
        defaultConfig: { action: 'post_message', channel: '#general', message: 'Hello from Agentflow!' }
      },
      {
        type: 'discord',
        label: 'Discord',
        description: 'Dispatch webhooks & bot messages',
        icon: MessageCircle,
        color: 'text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-500/40 bg-violet-50 dark:bg-violet-950/20',
        defaultConfig: { action: 'post_channel_message', channel: 'general', message: 'Alert notification' }
      },
      {
        type: 'google_sheets',
        label: 'Google Sheets',
        description: 'Append rows & query spreadsheets',
        icon: Table,
        color: 'text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-500/40 bg-teal-50 dark:bg-teal-950/20',
        defaultConfig: { action: 'append_row', spreadsheetId: 'default_sheet', range: 'Sheet1!A:E' }
      }
    ]
  }
];

export default function NodePalette() {
  const [search, setSearch] = useState('');

  const onDragStart = (event, nodeType, label, defaultConfig) => {
    event.dataTransfer.setData('application/agentflow-node-type', nodeType);
    event.dataTransfer.setData('application/agentflow-node-label', label);
    event.dataTransfer.setData('application/agentflow-default-config', JSON.stringify(defaultConfig || {}));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white dark:bg-[#0d1424] border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none transition-colors duration-150">
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/60 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {PALETTE_CATEGORIES.map((cat) => {
          const filtered = cat.items.filter(
            (item) =>
              item.label.toLowerCase().includes(search.toLowerCase()) ||
              item.description.toLowerCase().includes(search.toLowerCase())
          );

          if (filtered.length === 0) return null;

          return (
            <div key={cat.category} className="space-y-2">
              <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                {cat.category}
              </h5>
              <div className="space-y-1.5">
                {filtered.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => onDragStart(e, item.type, item.label, item.defaultConfig)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 cursor-grab active:cursor-grabbing shadow-sm transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-1.5 rounded-lg border ${item.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
