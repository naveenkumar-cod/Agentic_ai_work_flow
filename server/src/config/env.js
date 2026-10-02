const path = require('path');
const dotenv = require('dotenv');

// Load .env file from server root or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_agentflow_change_me_in_prod_12345',
  credentialEncryptionKey: process.env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agentflow_ai',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    },
    slack: {
      clientId: process.env.SLACK_CLIENT_ID || '',
      clientSecret: process.env.SLACK_CLIENT_SECRET || ''
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || ''
    }
  }
};

module.exports = config;
