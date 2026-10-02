const axios = require('axios');
const config = require('../config/env');

class AIService {
  async generateWorkflowFromPrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt is required for workflow generation');
    }

    const trimmed = prompt.trim();

    // Strategy 1: OpenRouter
    if (config.openRouterApiKey) {
      try {
        const result = await this._generateWithOpenRouter(trimmed);
        if (result) return { ...result, generatorEngine: 'OpenRouter (Claude 3.5 / GPT-4o)' };
      } catch (err) {
        console.warn('⚠️ OpenRouter generation failed, falling back:', err.message);
      }
    }

    // Strategy 2: Google Gemini
    if (config.geminiApiKey) {
      try {
        const result = await this._generateWithGemini(trimmed);
        if (result) return { ...result, generatorEngine: 'Google Gemini 1.5' };
      } catch (err) {
        console.warn('⚠️ Gemini generation failed, falling back:', err.message);
      }
    }

    // Strategy 3: Deterministic Rule-Based Graph Builder
    return this._generateDeterministicWorkflow(trimmed);
  }

  async _generateWithOpenRouter(prompt) {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: `You are an AI workflow builder for Agentflow_AI. Convert the user prompt into a valid JSON workflow graph.
Output ONLY raw JSON with:
{
  "name": "string",
  "description": "string",
  "triggerConfig": { "type": "manual" | "webhook" | "schedule" | "email" },
  "nodes": [
    { "id": "string", "type": "trigger"|"ai"|"gmail"|"slack"|"discord"|"google-sheets"|"condition"|"transform", "position": { "x": number, "y": number }, "data": { "label": "string", "nodeType": "string", "config": {} } }
  ],
  "edges": [
    { "id": "string", "source": "string", "target": "string", "animated": true }
  ],
  "tags": ["string"]
}`
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          Authorization: `Bearer ${config.openRouterApiKey}`,
          'HTTP-Referer': config.clientUrl,
          'X-Title': 'Agentflow AI'
        },
        timeout: 20000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
    return null;
  }

  async _generateWithGemini(prompt) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are an AI workflow architect. Convert the automation prompt into a JSON workflow graph for Agentflow_AI.
Return ONLY valid JSON matching this schema:
{
  "name": "Short title",
  "description": "Detailed explanation",
  "triggerConfig": { "type": "manual" },
  "nodes": [
    { "id": "node_1", "type": "trigger", "position": { "x": 100, "y": 200 }, "data": { "label": "Trigger", "nodeType": "trigger", "config": {} } }
  ],
  "edges": [
    { "id": "e1-2", "source": "node_1", "target": "node_2", "animated": true }
  ],
  "tags": ["automation"]
}`;

    const res = await model.generateContent(`${systemPrompt}\n\nUser Request: ${prompt}`);
    const text = res.response.text();
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  }

  _generateDeterministicWorkflow(prompt) {
    const lower = prompt.toLowerCase();
    const nodes = [];
    const edges = [];
    let curX = 100;
    const curY = 250;
    const stepX = 260;

    // Node 1: Trigger
    let triggerType = 'manual';
    let triggerLabel = 'Manual Trigger';
    let triggerConfig = { type: 'manual' };

    if (lower.includes('email') || lower.includes('gmail') || lower.includes('inbox')) {
      triggerType = 'gmail';
      triggerLabel = 'Gmail Trigger (New Email)';
      triggerConfig = { type: 'email', query: 'is:unread category:primary' };
    } else if (lower.includes('schedule') || lower.includes('daily') || lower.includes('hourly') || lower.includes('cron')) {
      triggerType = 'trigger';
      triggerLabel = 'Schedule Cron Trigger';
      triggerConfig = { type: 'schedule', cron: '0 9 * * *' };
    } else if (lower.includes('webhook') || lower.includes('api payload') || lower.includes('incoming')) {
      triggerType = 'trigger';
      triggerLabel = 'Incoming Webhook Trigger';
      triggerConfig = { type: 'webhook', path: '/webhook/v1/trigger' };
    } else {
      triggerType = 'trigger';
      triggerLabel = 'Operator Trigger';
      triggerConfig = { type: 'manual' };
    }

    const triggerId = 'node_trigger_1';
    nodes.push({
      id: triggerId,
      type: triggerType === 'gmail' ? 'gmail' : 'trigger',
      position: { x: curX, y: curY },
      data: {
        id: triggerId,
        label: triggerLabel,
        nodeType: triggerType === 'gmail' ? 'gmail' : 'trigger',
        description: 'Initiates automation upon incoming event payload',
        config: triggerConfig,
        status: 'idle'
      }
    });

    let prevNodeId = triggerId;

    // AI Step
    if (lower.includes('ai') || lower.includes('sentiment') || lower.includes('analyze') || lower.includes('extract') || lower.includes('classify') || lower.includes('summary')) {
      curX += stepX;
      const aiNodeId = 'node_ai_2';
      let aiPrompt = 'Analyze the incoming text, evaluate sentiment and urgency, and extract key action items as structured JSON.';
      if (lower.includes('sentiment')) {
        aiPrompt = 'Evaluate sentiment of {{$trigger.data.body || $trigger.data.text}} (POSITIVE, NEUTRAL, NEGATIVE). Return confidence and emotional tone.';
      } else if (lower.includes('extract') || lower.includes('invoice')) {
        aiPrompt = 'Extract invoice number, total amount due, vendor name, and due date from {{$trigger.data.body}} as structured JSON.';
      } else if (lower.includes('classify')) {
        aiPrompt = 'Classify message intent into: SUPPORT_URGENT, BILLING, FEATURE_REQUEST, GENERAL_FEEDBACK.';
      }

      nodes.push({
        id: aiNodeId,
        type: 'ai',
        position: { x: curX, y: curY },
        data: {
          id: aiNodeId,
          label: 'AI Reasoning & Analysis',
          nodeType: 'ai',
          description: 'LLM reasoning engine processing prompt variables',
          config: {
            model: 'gpt-4o',
            prompt: aiPrompt,
            temperature: 0.2
          },
          status: 'idle'
        }
      });

      edges.push({
        id: `e_${prevNodeId}_${aiNodeId}`,
        source: prevNodeId,
        target: aiNodeId,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      });

      prevNodeId = aiNodeId;
    }

    // Google Sheets Step
    if (lower.includes('sheet') || lower.includes('google sheet') || lower.includes('spreadsheet') || lower.includes('table') || lower.includes('append')) {
      curX += stepX;
      const sheetsNodeId = 'node_sheets_3';
      nodes.push({
        id: sheetsNodeId,
        type: 'google-sheets',
        position: { x: curX, y: curY },
        data: {
          id: sheetsNodeId,
          label: 'Append to Google Sheets',
          nodeType: 'google-sheets',
          description: 'Appends structured execution row to active audit spreadsheet',
          config: {
            action: 'append_row',
            spreadsheetId: 'OPERATIONS_MASTER_LOG',
            sheetName: 'Automations_Log',
            values: ['{{$now}}', '{{$trigger.data.from || "User"}}', '{{$node_ai_2.output.sentiment || "Processed"}}', '{{$node_ai_2.output.summary || "Success"}}']
          },
          status: 'idle'
        }
      });

      edges.push({
        id: `e_${prevNodeId}_${sheetsNodeId}`,
        source: prevNodeId,
        target: sheetsNodeId,
        animated: true,
        style: { stroke: '#14b8a6', strokeWidth: 2 }
      });

      prevNodeId = sheetsNodeId;
    }

    // Slack Step
    if (lower.includes('slack') || lower.includes('alert') || lower.includes('notify') || lower.includes('channel')) {
      curX += stepX;
      const slackNodeId = 'node_slack_4';
      nodes.push({
        id: slackNodeId,
        type: 'slack',
        position: { x: curX, y: curY },
        data: {
          id: slackNodeId,
          label: 'Slack Channel Notification',
          nodeType: 'slack',
          description: 'Dispatches rich markdown alert to Slack operations channel',
          config: {
            action: 'post_message',
            channel: '#ai-ops-alerts',
            message: '🚨 *Agentflow Pipeline Alert*\n• *Source:* {{$trigger.data.from || "System"}}\n• *Status:* Processed\n• *Result:* {{$node_ai_2.output.sentiment || "Complete"}}'
          },
          status: 'idle'
        }
      });

      edges.push({
        id: `e_${prevNodeId}_${slackNodeId}`,
        source: prevNodeId,
        target: slackNodeId,
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      });

      prevNodeId = slackNodeId;
    }

    // Discord Step
    if (lower.includes('discord') || lower.includes('bot')) {
      curX += stepX;
      const discordNodeId = 'node_discord_5';
      nodes.push({
        id: discordNodeId,
        type: 'discord',
        position: { x: curX, y: curY + 120 },
        data: {
          id: discordNodeId,
          label: 'Discord Broadcast',
          nodeType: 'discord',
          description: 'Broadcasts embed notification to Discord server channel',
          config: {
            channelId: 'general-announcements',
            content: '⚡ Automation Event processed successfully: {{$now}}'
          },
          status: 'idle'
        }
      });

      edges.push({
        id: `e_${triggerId}_${discordNodeId}`,
        source: triggerId,
        target: discordNodeId,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 }
      });
    }

    // If only trigger was created, add an AI Analysis and Slack notification step
    if (nodes.length === 1) {
      curX += stepX;
      const defaultAiId = 'node_ai_default';
      nodes.push({
        id: defaultAiId,
        type: 'ai',
        position: { x: curX, y: curY },
        data: {
          id: defaultAiId,
          label: 'AI Automation Processing',
          nodeType: 'ai',
          description: 'Performs natural language reasoning on input payload',
          config: {
            model: 'gpt-4o',
            prompt: `Execute automation logic for: "${prompt}" using input: {{$trigger.data}}`,
            temperature: 0.3
          },
          status: 'idle'
        }
      });

      edges.push({
        id: `e_${prevNodeId}_${defaultAiId}`,
        source: prevNodeId,
        target: defaultAiId,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      });

      curX += stepX;
      const defaultSlackId = 'node_slack_default';
      nodes.push({
        id: defaultSlackId,
        type: 'slack',
        position: { x: curX, y: curY },
        data: {
          id: defaultSlackId,
          label: 'Slack Notification Dispatch',
          nodeType: 'slack',
          description: 'Dispatches operation completion notification to team',
          config: {
            channel: '#general-operations',
            message: `✅ Agentflow Task Finished: "${prompt}"\nResult: {{$node_ai_default.output.result || "Success"}}`
          },
          status: 'idle'
        }
      });

      edges.push({
        id: `e_${defaultAiId}_${defaultSlackId}`,
        source: defaultAiId,
        target: defaultSlackId,
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      });
    }

    // Capitalize title
    const shortTitle = prompt.slice(0, 45).replace(/[^\w\s-]/g, '').trim() || 'AI Multi-Agent Pipeline';
    const name = shortTitle.charAt(0).toUpperCase() + shortTitle.slice(1);

    return {
      name,
      description: `Autonomous multi-agent workflow generated for prompt: "${prompt}"`,
      triggerConfig,
      nodes,
      edges,
      tags: ['ai-generated', 'multi-agent', 'automated'],
      generatorEngine: 'Deterministic Agentic Rule Engine'
    };
  }
}

module.exports = new AIService();
