import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Zap,
  Sparkles,
  Mail,
  MessageSquare,
  MessageCircle,
  Table,
  GitBranch,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

const NODE_CONFIGS = {
  trigger: {
    icon: Zap,
    color: 'border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    badge: 'TRIGGER',
    accent: 'from-amber-500/10 to-orange-600/5 dark:from-amber-500/30 dark:to-orange-600/10'
  },
  ai_prompt: {
    icon: Sparkles,
    color: 'border-indigo-300 dark:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
    badge: 'AI AGENT',
    accent: 'from-indigo-500/10 to-purple-600/5 dark:from-indigo-500/30 dark:to-purple-600/10'
  },
  ai: {
    icon: Sparkles,
    color: 'border-indigo-300 dark:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
    badge: 'AI AGENT',
    accent: 'from-indigo-500/10 to-purple-600/5 dark:from-indigo-500/30 dark:to-purple-600/10'
  },
  gmail: {
    icon: Mail,
    color: 'border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
    badge: 'GMAIL',
    accent: 'from-rose-500/10 to-red-600/5 dark:from-rose-500/30 dark:to-red-600/10'
  },
  slack: {
    icon: MessageSquare,
    color: 'border-emerald-300 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    badge: 'SLACK',
    accent: 'from-emerald-500/10 to-teal-600/5 dark:from-emerald-500/30 dark:to-teal-600/10'
  },
  discord: {
    icon: MessageCircle,
    color: 'border-violet-300 dark:border-violet-500/50 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400',
    badge: 'DISCORD',
    accent: 'from-violet-500/10 to-indigo-600/5 dark:from-violet-500/30 dark:to-indigo-600/10'
  },
  google_sheets: {
    icon: Table,
    color: 'border-teal-300 dark:border-teal-500/50 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400',
    badge: 'SHEETS',
    accent: 'from-teal-500/10 to-emerald-600/5 dark:from-teal-500/30 dark:to-emerald-600/10'
  },
  'google-sheets': {
    icon: Table,
    color: 'border-teal-300 dark:border-teal-500/50 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400',
    badge: 'SHEETS',
    accent: 'from-teal-500/10 to-emerald-600/5 dark:from-teal-500/30 dark:to-emerald-600/10'
  },
  condition: {
    icon: GitBranch,
    color: 'border-orange-300 dark:border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400',
    badge: 'LOGIC',
    accent: 'from-orange-500/10 to-amber-600/5 dark:from-orange-500/30 dark:to-amber-600/10'
  },
  transform: {
    icon: Cpu,
    color: 'border-blue-300 dark:border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    badge: 'TRANSFORM',
    accent: 'from-blue-500/10 to-cyan-600/5 dark:from-blue-500/30 dark:to-cyan-600/10'
  }
};

const WorkflowNode = ({ data, selected, type }) => {
  const nodeType = type || data?.nodeType || 'transform';
  const conf = NODE_CONFIGS[nodeType] || NODE_CONFIGS.transform;
  const Icon = conf.icon;
  const isTrigger = nodeType === 'trigger';

  return (
    <div
      className={`relative min-w-[220px] max-w-[260px] rounded-2xl bg-white dark:bg-[#0f172a] border transition-all duration-200 shadow-lg shadow-slate-900/5 dark:shadow-xl ${
        selected
          ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/30 dark:ring-indigo-500/40 shadow-indigo-500/10 dark:shadow-indigo-500/20 scale-[1.02]'
          : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-indigo-500 border-2 border-white dark:border-slate-900 rounded-full"
        />
      )}

      <div className={`p-3.5 rounded-t-2xl bg-gradient-to-r ${conf.accent} border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between`}>
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl border ${conf.color} bg-white dark:bg-slate-900/90 shadow-sm`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
              {conf.badge}
            </span>
          </div>
        </div>

        {data?.status === 'running' && (
          <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-spin" />
        )}
        {data?.status === 'completed' && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        )}
        {data?.status === 'error' && (
          <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
        )}
      </div>

      <div className="p-3.5 space-y-1">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{data?.label || 'Node Action'}</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {data?.description || data?.config?.action || data?.config?.triggerType || data?.config?.prompt || 'Click to configure node parameters'}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-indigo-500 border-2 border-white dark:border-slate-900 rounded-full"
      />
    </div>
  );
};

export const customNodeTypes = {
  trigger: memo((props) => <WorkflowNode {...props} type="trigger" />),
  ai_prompt: memo((props) => <WorkflowNode {...props} type="ai_prompt" />),
  ai: memo((props) => <WorkflowNode {...props} type="ai" />),
  gmail: memo((props) => <WorkflowNode {...props} type="gmail" />),
  slack: memo((props) => <WorkflowNode {...props} type="slack" />),
  discord: memo((props) => <WorkflowNode {...props} type="discord" />),
  google_sheets: memo((props) => <WorkflowNode {...props} type="google_sheets" />),
  'google-sheets': memo((props) => <WorkflowNode {...props} type="google-sheets" />),
  condition: memo((props) => <WorkflowNode {...props} type="condition" />),
  transform: memo((props) => <WorkflowNode {...props} type="transform" />),
};

export default customNodeTypes;
