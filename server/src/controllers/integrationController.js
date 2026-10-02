const integrationService = require('../services/integrationService');

class IntegrationController {
  async listIntegrations(req, res, next) {
    try {
      const integrations = await integrationService.listIntegrations(req.user._id);
      return res.status(200).json({ success: true, data: integrations });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req, res, next) {
    try {
      const status = await integrationService.getHealthStatus(req.user._id);
      return res.status(200).json({ success: true, data: status });
    } catch (err) {
      next(err);
    }
  }

  async saveApiKey(req, res, next) {
    try {
      const { provider, apiKey } = req.body;
      const updated = await integrationService.saveApiKey(req.user._id, provider, apiKey);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async disconnect(req, res, next) {
    try {
      const { provider } = req.params;
      const result = await integrationService.disconnect(req.user._id, provider);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async startOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      // In dev environment, redirect back with simulated success or return url
      return res.redirect(`/api/integrations/oauth/${provider}/callback?code=simulated_code_123`);
    } catch (err) {
      next(err);
    }
  }

  async callbackOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      await integrationService.saveApiKey(req.user._id, provider, `oauth_token_${Date.now()}`);
      return res.redirect('/integrations?oauth=success');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IntegrationController();
