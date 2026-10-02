const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const orchestrator = require('../agents/orchestrator');
const { addExecutionJob } = require('../queues/executionQueue');

class ExecutionService {
  async listExecutions(userId, { status, limit = 50 } = {}) {
    const query = { owner: userId };
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const executions = await Execution.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('workflowId', 'name description');

    return executions;
  }

  async getExecutionById(id, userId) {
    const execution = await Execution.findOne({ _id: id, owner: userId }).populate(
      'workflowId',
      'name description status'
    );
    if (!execution) {
      const err = new Error('Execution run not found');
      err.statusCode = 404;
      throw err;
    }
    return execution;
  }

  async getTimeline(executionId) {
    const logs = await ExecutionLog.find({ executionId }).sort({ timestamp: 1 });
    return logs;
  }

  async startExecution(workflowId, userId, inputs = {}) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found or unauthorized');
      err.statusCode = 404;
      throw err;
    }

    const execution = await Execution.create({
      workflowId: workflow._id,
      workflowSnapshot: {
        _id: workflow._id,
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        triggerConfig: workflow.triggerConfig,
      },
      owner: userId,
      status: 'PENDING',
      inputs,
      startTime: new Date(),
    });

    // Queue background job
    await addExecutionJob({
      executionId: execution._id,
      workflowGraph: execution.workflowSnapshot,
      inputs,
      userId,
    });

    return execution;
  }

  async pauseExecution(id, userId) {
    const execution = await this.getExecutionById(id, userId);
    orchestrator.pause(execution._id);
    execution.status = 'PAUSED';
    await execution.save();
    return execution;
  }

  async resumeExecution(id, userId) {
    const execution = await this.getExecutionById(id, userId);
    orchestrator.resume(execution._id);
    execution.status = 'RUNNING';
    await execution.save();
    return execution;
  }

  async cancelExecution(id, userId) {
    const execution = await this.getExecutionById(id, userId);
    orchestrator.cancel(execution._id);
    execution.status = 'CANCELLED';
    execution.endTime = new Date();
    await execution.save();
    return execution;
  }
}

module.exports = new ExecutionService();
