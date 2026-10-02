const crypto = require('crypto');
const config = require('../config/env');
const Integration = require('../models/Integration');
const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');

const ALL_PROVIDERS = [
  'gmail',
  'slack',
  'discord',
  'google-sheets',
  'openrouter',
  'gemini',
];

class IntegrationService {
  _getEncryptionKey() {
    return crypto.createHash('sha256').update(String(config.credentialEncryptionKey)).digest();
  }

  encrypt(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this._getEncryptionKey(), iv);
    let encrypted = cipher.update(typeof text === 'object' ? JSON.stringify(text) : String(text));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(encryptedData) {
    if (!encryptedData) return null;
    try {
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = Buffer.from(parts[1], 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', this._getEncryptionKey(), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      const str = decrypted.toString();
      try {
        return JSON.parse(str);
      } catch (_) {
        return str;
      }
    } catch (err) {
      console.warn('Decryption failed:', err.message);
      return null;
    }
  }

  async listIntegrations(userId) {
    const existing = await Integration.find({ owner: userId });
    const map = new Map(existing.map((item) => [item.provider, item]));

    return ALL_PROVIDERS.map((provider) => {
      const doc = map.get(provider);
      return {
        provider,
        isConnected: doc ? doc.isConnected : false,
        metadata: doc?.metadata || {},
        updatedAt: doc?.updatedAt || null,
      };
    });
  }

  async getHealthStatus(userId) {
    const integrations = await Integration.find({ owner: userId });
    const statusMap = {};

    ALL_PROVIDERS.forEach((provider) => {
      const item = integrations.find((i) => i.provider === provider);
      statusMap[provider] = {
        connected: !!item?.isConnected,
        status: item?.isConnected ? 'healthy' : 'disconnected',
        lastChecked: new Date().toISOString(),
      };
    });

    return statusMap;
  }

  async saveApiKey(userId, provider, apiKey) {
    const encrypted = this.encrypt(apiKey);
    const updated = await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        isConnected: true,
        encryptedCredentials: encrypted,
        metadata: {
          keyPreview: `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`,
          configuredAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    return updated;
  }

  async disconnect(userId, provider) {
    await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        isConnected: false,
        encryptedCredentials: null,
        metadata: {},
      },
      { upsert: true }
    );
    return { success: true, provider, isConnected: false };
  }

  async getCredentials(userId, provider) {
    const doc = await Integration.findOne({ owner: userId, provider });
    if (!doc || !doc.isConnected || !doc.encryptedCredentials) {
      return null;
    }
    return this.decrypt(doc.encryptedCredentials);
  }

  getHandler(provider) {
    switch (provider) {
      case 'gmail':
        return gmailIntegration;
      case 'slack':
        return slackIntegration;
      case 'discord':
        return discordIntegration;
      case 'google-sheets':
        return googleSheetsIntegration;
      default:
        return null;
    }
  }
}

module.exports = new IntegrationService();
