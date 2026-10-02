class BaseIntegration {
  constructor(providerName) {
    this.providerName = providerName;
  }

  async testConnection(credentials) {
    throw new Error('testConnection() not implemented');
  }

  async execute(action, params, credentials) {
    throw new Error('execute() not implemented');
  }
}

module.exports = BaseIntegration;
