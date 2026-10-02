class RecoveryAgent {
  handleFailure(error, retryCount = 0) {
    const message = (error?.message || String(error)).toLowerCase();
    let classification = 'API_FAILURE';

    if (message.includes('missing') || message.includes('required') || message.includes('schema') || message.includes('field')) {
      classification = 'MISSING_FIELDS';
    } else if (message.includes('auth') || message.includes('token') || message.includes('unauthorized') || message.includes('expired') || message.includes('401')) {
      classification = 'AUTH_EXPIRED';
    } else if (message.includes('rate limit') || message.includes('429') || message.includes('quota') || message.includes('too many requests')) {
      classification = 'RATE_LIMIT';
    } else if (message.includes('timeout') || message.includes('econnreset') || message.includes('econnrefused') || message.includes('503') || message.includes('network') || message.includes('connection')) {
      classification = 'TRANSIENT';
    }

    const maxRetries = 3;
    let decision = 'escalate';
    let backoffMs = 0;

    if (retryCount < maxRetries) {
      if (classification === 'TRANSIENT' || classification === 'RATE_LIMIT' || classification === 'API_FAILURE') {
        decision = 'retry_with_backoff';
        backoffMs = Math.min(Math.pow(2, retryCount) * 1000, 10000);
      }
    }

    return {
      classification,
      decision,
      backoffMs,
      retryCount,
      reason: error?.message || 'Unknown node execution failure',
      suggestedAction: decision === 'retry_with_backoff' ? `Auto-retrying in ${backoffMs}ms` : 'Escalating failure to operator notification drawer'
    };
  }
}

module.exports = new RecoveryAgent();
