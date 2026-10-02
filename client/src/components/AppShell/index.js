import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import ThemeSelector from '../ThemeSelector';
import {
  LayoutDashboard,
  GitFork,
  Sparkles,
  PlayCircle,
  Puzzle,
  Settings,
  Bell,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Menu,
  X
} from 'lucide-react';

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (_) {}
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();

    const socket = getSocket();
    if (socket) {
      const handleNotif = (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('notification', handleNotif);
      socket.on('global_notification', handleNotif);

      return () => {
        socket.off('notification', handleNotif);
        socket.off('global_notification', handleNotif);
      };
    }
  }, [isAuthenticated]);

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', href: '/workflows', icon: GitFork },
    { name: 'AI Generator', href: '/workflows/builder', icon: Sparkles, highlight: true },
    { name: 'Executions', href: '/executions', icon: PlayCircle },
    { name: 'Integrations', href: '/integrations', icon: Puzzle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-6 h-16 flex items-center justify-between transition-colors duration-150">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-600 dark:from-white dark:via-indigo-100 dark:to-indigo-400">
                Agentflow<span className="text-indigo-600 dark:text-indigo-400">_AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                Multi-Agent
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Selector */}
          <ThemeSelector variant="compact" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 shadow-2xl shadow-slate-900/10 dark:shadow-black/80 z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Live Agent Notifications</h4>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id || Math.random()}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start space-x-3 ${
                          !n.isRead ? 'bg-indigo-50/60 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
                          {n.type === 'error' && <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />}
                          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
                          {n.type === 'info' && <Info className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />}
                        </div>
                        <div className="flex-1 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-slate-200">{n.title}</p>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">
                            {new Date(n.createdAt || Date.now()).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Operator'}</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono capitalize font-medium">{user?.role || 'Operator'}</span>
            </div>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-300 dark:hover:border-rose-800/50 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0c1220] border-b border-slate-200 dark:border-slate-800 p-4 space-y-2 z-30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.highlight && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:flex w-64 bg-white/80 dark:bg-[#0c1220]/95 border-r border-slate-200 dark:border-slate-800/80 flex-col justify-between p-4 transition-colors duration-150">
          <div className="space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Operations Center
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.highlight && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Multi-Agent Engine</span>
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5" />
                Live
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              5 Agents (Planner, Exec, Valid, Recov, Monit) active.
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#090d16] flex flex-col transition-colors duration-150">
          {children}
        </main>
      </div>
    </div>
  );
}
