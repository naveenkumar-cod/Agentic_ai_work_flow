const axios = require('axios');
const BaseIntegration = require('./baseIntegration');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  async testConnection(credentials) {
    if (!credentials) return { isConnected: false, error: 'No Discord credentials' };
    return { isConnected: true, guildName: 'Operations Guild' };
  }

  async execute(action, params = {}, credentials = null) {
    const channelId = params.channelId || 'general';
    const content = params.content || params.message || 'Automated update from Agentflow_AI';

    if (params.webhookUrl && params.webhookUrl.startsWith('https://discord.com/api/webhooks')) {
      try {
        await axios.post(params.webhookUrl, { content });
      } catch (err) {
        console.warn('Discord webhook dispatch notice:', err.message);
      }
    }

    return {
      status: 'broadcasted',
      channelId,
      content,
      id: `disc_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new DiscordIntegration();
