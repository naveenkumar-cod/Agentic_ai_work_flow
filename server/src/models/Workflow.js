const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'active',
    },
    triggerConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ type: 'manual' }),
    },
    nodes: {
      type: Array,
      default: () => [],
    },
    edges: {
      type: Array,
      default: () => [],
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: () => [],
    },
  },
  {
    timestamps: true,
  }
);

workflowSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Workflow', workflowSchema);
