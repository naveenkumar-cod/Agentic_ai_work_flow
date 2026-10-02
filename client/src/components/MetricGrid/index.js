import { GitFork, Activity, CheckCircle, Zap, Puzzle, Bot } from 'lucide-react';

export default function MetricGrid({ metrics = {} }) {
  const items = [
    {
      title: 'Total Workflows',
      value: metrics.totalWorkflows ?? 0,
      sub: `${metrics.activeWorkflows ?? 0} active`,
      icon: GitFork,
      color: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20',
      border: 'border-blue-200 dark:border-blue-500/30',
      iconBg: 'bg-blue-50 dark:bg-slate-900/80 border-blue-200 dark:border-slate-700/50',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Total Executions',
      value: metrics.totalExecutions ?? 0,
      sub: `${metrics.completedExecutions ?? 0} completed`,
      icon: Activity,
      color: 'from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20',
      border: 'border-purple-200 dark:border-purple-500/30',
      iconBg: 'bg-purple-50 dark:bg-slate-900/80 border-purple-200 dark:border-slate-700/50',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate ?? 100}%`,
      sub: `${metrics.failedExecutions ?? 0} failed`,
      icon: CheckCircle,
      color: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      iconBg: 'bg-emerald-50 dark:bg-slate-900/80 border-emerald-200 dark:border-slate-700/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Connected Integrations',
      value: metrics.connectedIntegrations ?? 0,
      sub: 'Gmail, Slack, Discord, Sheets',
      icon: Puzzle,
      color: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20',
      border: 'border-amber-200 dark:border-amber-500/30',
      iconBg: 'bg-amber-50 dark:bg-slate-900/80 border-amber-200 dark:border-slate-700/50',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: 'Agent Invocations',
      value: (metrics.agentInvocations ?? 0).toLocaleString(),
      sub: '5-Agent Pipeline Active',
      icon: Bot,
      color: 'from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20',
      border: 'border-cyan-200 dark:border-cyan-500/30',
      iconBg: 'bg-cyan-50 dark:bg-slate-900/80 border-cyan-200 dark:border-slate-700/50',
      iconColor: 'text-cyan-600 dark:text-cyan-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-gradient-to-br ${item.color} bg-white dark:bg-[#0e1626] border ${item.border} backdrop-blur-md shadow-lg shadow-slate-900/5 dark:shadow-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-indigo-500/10 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.title}</span>
              <div className={`p-2 rounded-xl border ${item.iconBg} ${item.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">{item.value}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
