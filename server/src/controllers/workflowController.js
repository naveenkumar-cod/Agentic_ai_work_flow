const workflowService = require('../services/workflowService');
const executionService = require('../services/executionService');
const aiService = require('../services/aiService');

class WorkflowController {
  async getDashboard(req, res, next) {
    try {
      const data = await workflowService.getDashboard(req.user._id);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listWorkflows(req, res, next) {
    try {
      const { search, page, limit } = req.query;
      const result = await workflowService.listWorkflows(req.user._id, { search, page, limit });
      return res.status(200).json({ success: true, data: result.workflows, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async createWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.user._id, req.body);
      return res.status(201).json({ success: true, data: workflow });
    } catch (err) {
      next(err);
    }
  }

  async generateWorkflow(req, res, next) {
    try {
      const { prompt } = req.body;
      const generated = await aiService.generateWorkflowFromPrompt(prompt);
      return res.status(200).json({ success: true, data: generated });
    } catch (err) {
      next(err);
    }
  }

  async getWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.params.id, req.user._id);
      return res.status(200).json({ success: true, data: workflow });
    } catch (err) {
      next(err);
    }
  }

  async updateWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.updateWorkflow(req.params.id, req.user._id, req.body);
      return res.status(200).json({ success: true, data: workflow });
    } catch (err) {
      next(err);
    }
  }

  async duplicateWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.duplicateWorkflow(req.params.id, req.user._id);
      return res.status(201).json({ success: true, data: workflow });
    } catch (err) {
      next(err);
    }
  }

  async executeWorkflow(req, res, next) {
    try {
      const execution = await executionService.startExecution(
        req.params.id,
        req.user._id,
        req.body?.inputs || {}
      );
      return res.status(201).json({ success: true, data: execution });
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkflow(req, res, next) {
    try {
      const result = await workflowService.deleteWorkflow(req.params.id, req.user._id);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkflowController();
