const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'],
      required: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    scopes: {
      type: [String],
      default: () => [],
    },
    encryptedCredentials: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);
