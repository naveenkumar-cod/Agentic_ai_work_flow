const config = require('../config/env');
const orchestrator = require('../agents/orchestrator');

let queue = null;
let isRedisAvailable = false;

try {
  const { Queue, Worker } = require('bullmq');
  const IORedis = require('ioredis');

  const connection = new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: () => null, // Don't hang on connection failure
  });

  connection.on('connect', () => {
    isRedisAvailable = true;
    console.log('✅ [Queue] Connected to Redis BullMQ');
  });

  connection.on('error', (err) => {
    if (!isRedisAvailable) {
      // Quietly silence unhandled connection rejection in memory mode
    }
  });

  queue = new Queue('agentflow-executions', { connection });

  new Worker(
    'agentflow-executions',
    async (job) => {
      const { executionId, workflowGraph, inputs, userId } = job.data;
      await orchestrator.runWorkflow(executionId, workflowGraph, inputs, userId);
    },
    { connection }
  );
} catch (err) {
  console.warn('⚠️ [Queue] Initialized in-memory asynchronous execution queue.');
}

async function addExecutionJob({ executionId, workflowGraph, inputs = {}, userId = null }) {
  if (isRedisAvailable && queue) {
    try {
      await queue.add('run-execution', {
        executionId,
        workflowGraph,
        inputs,
        userId,
      });
      return;
    } catch (_) {}
  }

  // In-memory fallback
  setImmediate(async () => {
    try {
      await orchestrator.runWorkflow(executionId, workflowGraph, inputs, userId);
    } catch (err) {
      console.error('In-memory queue execution error:', err);
    }
  });
}

module.exports = {
  addExecutionJob,
};
