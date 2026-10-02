const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Integration = require('../models/Integration');

class WorkflowService {
  async getDashboard(userId) {
    const [
      totalWorkflows,
      activeAutomations,
      totalExecutions,
      completedExecutions,
      connectedIntegrations,
      agentInvocations,
      recentExecutions,
    ] = await Promise.all([
      Workflow.countDocuments({ owner: userId }),
      Workflow.countDocuments({ owner: userId, status: 'active' }),
      Execution.countDocuments({ owner: userId }),
      Execution.countDocuments({ owner: userId, status: 'COMPLETED' }),
      Integration.countDocuments({ owner: userId, isConnected: true }),
      ExecutionLog.countDocuments({}),
      Execution.find({ owner: userId })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('workflowId', 'name description status'),
    ]);

    const successRate = totalExecutions > 0
      ? Math.round((completedExecutions / totalExecutions) * 100)
      : 100;

    return {
      metrics: {
        totalWorkflows,
        activeAutomations,
        totalExecutions,
        successRate,
        connectedIntegrations,
        agentInvocations,
      },
      recentExecutions: recentExecutions.map((e) => ({
        _id: e._id,
        workflowId: e.workflowId?._id || e.workflowId,
        workflowName: e.workflowId?.name || e.workflowSnapshot?.name || 'Automation Run',
        status: e.status,
        duration: e.duration,
        createdAt: e.createdAt,
      })),
    };
  }

  async listWorkflows(userId, { search = '', page = 1, limit = 50 } = {}) {
    const query = { owner: userId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;
    const [workflows, total] = await Promise.all([
      Workflow.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Workflow.countDocuments(query),
    ]);

    return {
      workflows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async createWorkflow(userId, data) {
    const workflow = await Workflow.create({
      ...data,
      owner: userId,
    });
    return workflow;
  }

  async getWorkflowById(id, userId) {
    const workflow = await Workflow.findOne({ _id: id, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }
    return workflow;
  }

  async updateWorkflow(id, userId, updateData) {
    const workflow = await Workflow.findOneAndUpdate(
      { _id: id, owner: userId },
      {
        ...updateData,
        $inc: { version: 1 },
      },
      { new: true }
    );
    if (!workflow) {
      const err = new Error('Workflow not found or unauthorized');
      err.statusCode = 404;
      throw err;
    }
    return workflow;
  }

  async duplicateWorkflow(id, userId) {
    const original = await this.getWorkflowById(id, userId);
    const duplicated = await Workflow.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      owner: userId,
      status: 'draft',
      triggerConfig: original.triggerConfig,
      nodes: original.nodes,
      edges: original.edges,
      tags: [...original.tags, 'duplicate'],
      version: 1,
    });
    return duplicated;
  }

  async deleteWorkflow(id, userId) {
    const result = await Workflow.findOneAndDelete({ _id: id, owner: userId });
    if (!result) {
      const err = new Error('Workflow not found or unauthorized');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, id };
  }
}

module.exports = new WorkflowService();
