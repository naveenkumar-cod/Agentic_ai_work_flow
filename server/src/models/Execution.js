const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    workflowSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING',
    },
    currentNode: {
      type: String,
      default: null,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    outputs: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    error: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

executionSchema.index({ workflowId: 1, createdAt: -1 });
executionSchema.index({ owner: 1, createdAt: -1 });
executionSchema.index({ status: 1 });

module.exports = mongoose.model('Execution', executionSchema);
