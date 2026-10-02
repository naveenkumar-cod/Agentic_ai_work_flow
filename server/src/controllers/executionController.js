const executionService = require('../services/executionService');

class ExecutionController {
  async listExecutions(req, res, next) {
    try {
      const { status, limit } = req.query;
      const executions = await executionService.listExecutions(req.user._id, { status, limit });
      return res.status(200).json({ success: true, data: executions });
    } catch (err) {
      next(err);
    }
  }

  async getExecution(req, res, next) {
    try {
      const execution = await executionService.getExecutionById(req.params.id, req.user._id);
      return res.status(200).json({ success: true, data: execution });
    } catch (err) {
      next(err);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const logs = await executionService.getTimeline(req.params.id);
      return res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }

  async pauseExecution(req, res, next) {
    try {
      const execution = await executionService.pauseExecution(req.params.id, req.user._id);
      return res.status(200).json({ success: true, data: execution });
    } catch (err) {
      next(err);
    }
  }

  async resumeExecution(req, res, next) {
    try {
      const execution = await executionService.resumeExecution(req.params.id, req.user._id);
      return res.status(200).json({ success: true, data: execution });
    } catch (err) {
      next(err);
    }
  }

  async cancelExecution(req, res, next) {
    try {
      const execution = await executionService.cancelExecution(req.params.id, req.user._id);
      return res.status(200).json({ success: true, data: execution });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ExecutionController();
