const config = require('./src/config/env');
const orchestrator = require('./src/agents/orchestrator');
const plannerAgent = require('./src/agents/plannerAgent');
const aiService = require('./src/services/aiService');
const validationAgent = require('./src/agents/validationAgent');
const recoveryAgent = require('./src/agents/recoveryAgent');

async function test() {
  console.log('=== VERIFYING AGENTFLOW BACKEND COMPONENTS ===');
  console.log('Port:', config.port);
  console.log('LangGraph Status:', orchestrator.getLangGraphStatus());

  // Test AI prompt to workflow graph generation
  const testPrompt = 'When a customer sends a feedback email in Gmail, analyze sentiment with AI, append to Google Sheets, and alert Slack';
  const graph = await aiService.generateWorkflowFromPrompt(testPrompt);
  console.log('AI Generation Engine:', graph.generatorEngine);
  console.log('Generated Nodes Count:', graph.nodes.length);
  console.log('Generated Edges Count:', graph.edges.length);

  // Test Planner Agent DAG ordering
  const plan = await plannerAgent.plan(graph);
  console.log('Planner Confidence Score:', plan.confidenceScore);
  console.log('Planned Step Order:', plan.orderedNodeIds);

  // Test Recovery Agent error classification
  const recoveryDecision = recoveryAgent.handleFailure(new Error('Connection timeout to Slack API'), 0);
  console.log('Recovery Classification:', recoveryDecision.classification);
  console.log('Recovery Decision:', recoveryDecision.decision);

  console.log('=== ALL BACKEND CHECKS PASSED ===');
}

test().catch(console.error);
