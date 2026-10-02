class ValidationAgent {
  validateNodeInput(node, context) {
    const errors = [];
    const missingFields = [];
    const config = node.data?.config || {};
    const nodeType = node.type || node.data?.nodeType;

    switch (nodeType) {
      case 'slack':
        if (!config.channel && !config.channelId) {
          missingFields.push('channel');
          errors.push('Slack channel target is required');
        }
        if (!config.message && !config.text) {
          missingFields.push('message');
          errors.push('Slack message text is required');
        }
        break;
      case 'discord':
        if (!config.channelId && !config.webhookUrl) {
          missingFields.push('channelId');
          errors.push('Discord channelId or webhookUrl is required');
        }
        break;
      case 'google-sheets':
        if (!config.spreadsheetId) {
          missingFields.push('spreadsheetId');
          errors.push('Spreadsheet ID is required for Google Sheets operations');
        }
        break;
      case 'ai':
        if (!config.prompt) {
          missingFields.push('prompt');
          errors.push('Prompt is required for AI reasoning step');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      missingFields,
      errors,
    };
  }

  validateNodeOutput(node, output) {
    const errors = [];
    if (output === undefined || output === null) {
      errors.push(`Node [${node.data?.label || node.id}] produced empty output`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      outputSchemaMatched: true,
    };
  }
}

module.exports = new ValidationAgent();
