import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeSelector({ variant = 'compact', className = '' }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const options = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Clean high-contrast light theme'
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Operator console dark theme'
    },
    {
      id: 'system',
      label: 'System',
      icon: Laptop,
      description: 'Sync with OS color preference'
    }
  ];

  if (variant === 'settings') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-xl border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">{opt.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact Header / Nav Segmented Control
  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
      role="group"
      aria-label="Theme selection"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            title={`Switch to ${opt.label} Mode${opt.id === 'system' ? ` (Currently ${resolvedTheme})` : ''}`}
            aria-pressed={isSelected}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center space-x-1.5 ${
              isSelected
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline-block text-[11px]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
