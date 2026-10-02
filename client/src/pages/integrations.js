import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import {
  Puzzle,
  Mail,
  MessageSquare,
  MessageCircle,
  Table,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Key,
  Loader2
} from 'lucide-react';

const INTEGRATION_DEFINITIONS = [
  {
    provider: 'gmail',
    name: 'Google Gmail',
    description: 'Send emails, query inboxes, and create drafts over OAuth 2.0 with AES-256 encrypted tokens.',
    icon: Mail,
    color: 'border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
    type: 'oauth'
  },
  {
    provider: 'slack',
    name: 'Slack Workspace',
    description: 'Post automated channel alerts, direct notifications, and webhook messages to Slack teams.',
    icon: MessageSquare,
    color: 'border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    type: 'oauth'
  },
  {
    provider: 'discord',
    name: 'Discord Bot & Webhooks',
    description: 'Dispatch notifications, bot embeds, and automated channel broadcasts to Discord servers.',
    icon: MessageCircle,
    color: 'border-violet-200 dark:border-violet-500/40 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400',
    type: 'oauth'
  },
  {
    provider: 'google-sheets',
    name: 'Google Sheets',
    description: 'Append audit records, update cells, and read spreadsheet tabular data in automated steps.',
    icon: Table,
    color: 'border-teal-200 dark:border-teal-500/40 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400',
    type: 'oauth'
  },
  {
    provider: 'openrouter',
    name: 'OpenRouter AI',
    description: 'Universal gateway for GPT-4o, Claude 3.5, and Llama 3 LLM operations and reasoning.',
    icon: Sparkles,
    color: 'border-indigo-200 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
    type: 'api_key'
  },
  {
    provider: 'gemini',
    name: 'Google Gemini SDK',
    description: 'Direct integration with Gemini 1.5 Flash and 2.0 models for high-speed agent analysis.',
    icon: Sparkles,
    color: 'border-blue-200 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    type: 'api_key'
  }
];

export default function IntegrationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [integrations, setIntegrations] = useState([]);
  const [healthStatus, setHealthStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [apiKeyModalProvider, setApiKeyModalProvider] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const [listRes, statusRes] = await Promise.all([
        api.get('/integrations'),
        api.get('/integrations/status')
      ]);
      setIntegrations(listRes.data || []);
      setHealthStatus(statusRes.data || {});
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchIntegrations();

    if (router.query.connected) {
      alert(`Integration '${router.query.connected}' successfully connected!`);
      router.replace('/integrations', undefined, { shallow: true });
    }
  }, [isAuthenticated, router]);

  const handleConnectOAuth = async (provider) => {
    try {
      setActionLoading(provider);
      const res = await api.get(`/integrations/oauth/${provider}/start`);
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      alert(`OAuth connection failed: ${err.message}`);
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;
    try {
      setActionLoading(provider);
      await api.delete(`/integrations/${provider}`);
      await fetchIntegrations();
    } catch (err) {
      alert(`Disconnect failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnectApiKey = async () => {
    if (!apiKeyModalProvider || !apiKeyInput.trim()) return;
    try {
      setActionLoading(apiKeyModalProvider);
      await api.post('/integrations', {
        provider: apiKeyModalProvider,
        credentials: { apiKey: apiKeyInput.trim(), email: `${apiKeyModalProvider}_api@agentflow.ai` }
      });
      setApiKeyModalProvider(null);
      setApiKeyInput('');
      await fetchIntegrations();
    } catch (err) {
      alert(`Failed to save API key: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Third-Party Integrations</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Connect external SaaS services and AI providers. All credentials are encrypted at rest with AES-256-GCM.
              </p>
            </div>

            <button
              onClick={fetchIntegrations}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm flex items-center space-x-2 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATION_DEFINITIONS.map((def) => {
              const Icon = def.icon;
              const connectedInfo = integrations.find((i) => i.provider === def.provider);
              const isConnected = connectedInfo?.isConnected || false;
              const isBusy = actionLoading === def.provider;

              return (
                <div
                  key={def.provider}
                  className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-5 shadow-lg shadow-slate-900/5 dark:shadow-xl hover:border-indigo-400 dark:hover:border-slate-700 transition-all duration-150"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${def.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div>
                        {isConnected ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Disconnected
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{def.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {def.description}
                      </p>
                    </div>

                    {isConnected && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Connected Identity:</div>
                        <div className="font-mono text-slate-800 dark:text-slate-200 truncate">
                          {connectedInfo?.accountEmail || connectedInfo?.accountName || 'Active Connection'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    {isConnected ? (
                      <div className="flex items-center space-x-2 w-full justify-between">
                        <button
                          onClick={() => (def.type === 'oauth' ? handleConnectOAuth(def.provider) : setApiKeyModalProvider(def.provider))}
                          disabled={isBusy}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                        >
                          Reconnect
                        </button>
                        <button
                          onClick={() => handleDisconnect(def.provider)}
                          disabled={isBusy}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 font-semibold transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => (def.type === 'oauth' ? handleConnectOAuth(def.provider) : setApiKeyModalProvider(def.provider))}
                        disabled={isBusy}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : def.type === 'oauth' ? (
                          <>
                            <span>Connect with OAuth</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <Key className="w-3.5 h-3.5" />
                            <span>Set API Credentials</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {apiKeyModalProvider && (
            <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white capitalize">Connect {apiKeyModalProvider} API Key</h3>
                  </div>
                  <button
                    onClick={() => setApiKeyModalProvider(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Enter your {apiKeyModalProvider} API Key (encrypted at rest):
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setApiKeyModalProvider(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnectApiKey}
                    disabled={!apiKeyInput.trim() || actionLoading === apiKeyModalProvider}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                  >
                    Save & Encrypt
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
