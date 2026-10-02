const ExecutionLog = require('../models/ExecutionLog');
const { emitExecutionEvent } = require('../config/socket');

class MonitoringAgent {
  async logEvent({
    executionId,
    workflowId,
    nodeId = null,
    agent,
    level = 'info',
    message,
    metadata = {},
  }) {
    try {
      const logDoc = await ExecutionLog.create({
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: new Date(),
      });

      emitExecutionEvent(executionId, {
        logId: logDoc._id,
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: logDoc.timestamp,
      });

      return logDoc;
    } catch (err) {
      console.error('MonitoringAgent log failure:', err.message);
      // Fallback emit if DB write fails
      emitExecutionEvent(executionId, {
        logId: `temp_${Date.now()}`,
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: new Date(),
      });
    }
  }
}

module.exports = new MonitoringAgent();
