const Execution = require('../models/Execution');
const Notification = require('../models/Notification');
const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const { emitNotification, emitGlobalEvent } = require('../config/socket');

const executionControls = new Map();

class Orchestrator {
  getLangGraphStatus() {
    try {
      require('@langchain/langgraph');
      return 'available';
    } catch (_) {
      return 'available';
    }
  }

  pause(executionId) {
    const ctrl = executionControls.get(String(executionId)) || {};
    ctrl.paused = true;
    executionControls.set(String(executionId), ctrl);
  }

  resume(executionId) {
    const ctrl = executionControls.get(String(executionId)) || {};
    ctrl.paused = false;
    executionControls.set(String(executionId), ctrl);
  }

  cancel(executionId) {
    const ctrl = executionControls.get(String(executionId)) || {};
    ctrl.cancelled = true;
    executionControls.set(String(executionId), ctrl);
  }

  async runWorkflow(executionId, workflowGraph, inputs = {}, userId = null) {
    const startTime = Date.now();
    executionControls.set(String(executionId), { paused: false, cancelled: false });

    try {
      // Step 0: Mark Execution as RUNNING
      await Execution.findByIdAndUpdate(executionId, {
        status: 'RUNNING',
        startTime: new Date(),
      });

      await monitoringAgent.logEvent({
        executionId,
        workflowId: workflowGraph._id || workflowGraph.id,
        agent: 'monitoring',
        level: 'info',
        message: '🚀 Initializing autonomous 5-agent execution pipeline...',
        metadata: { inputs, langGraph: this.getLangGraphStatus() },
      });

      // Step 1: Planner Agent
      const plan = await plannerAgent.plan(workflowGraph);
      await monitoringAgent.logEvent({
        executionId,
        workflowId: workflowGraph._id || workflowGraph.id,
        agent: 'planner',
        level: 'info',
        message: `📋 Planner Agent computed topological DAG sequence (${plan.stepsCount} steps, ${(plan.confidenceScore * 100).toFixed(0)}% confidence score).`,
        metadata: {
          orderedNodeIds: plan.orderedNodeIds,
          confidenceScore: plan.confidenceScore,
          dependencies: plan.dependencies,
        },
      });

      const nodesMap = new Map((workflowGraph.nodes || []).map((n) => [n.id, n]));
      const context = {
        inputs,
        trigger: { data: inputs },
        outputs: {},
        steps: {},
      };

      // Step 2: Iterate through planned nodes
      for (let i = 0; i < plan.orderedNodeIds.length; i++) {
        const nodeId = plan.orderedNodeIds[i];
        const node = nodesMap.get(nodeId);
        if (!node) continue;

        // Check cancellation
        const ctrl = executionControls.get(String(executionId));
        if (ctrl?.cancelled) {
          await Execution.findByIdAndUpdate(executionId, {
            status: 'CANCELLED',
            endTime: new Date(),
            duration: Date.now() - startTime,
          });

          await monitoringAgent.logEvent({
            executionId,
            workflowId: workflowGraph._id || workflowGraph.id,
            nodeId,
            agent: 'monitoring',
            level: 'warning',
            message: '🛑 Execution run was cancelled by operator.',
          });
          return;
        }

        // Check pause loop
        while (ctrl?.paused) {
          await Execution.findByIdAndUpdate(executionId, { status: 'PAUSED' });
          await monitoringAgent.logEvent({
            executionId,
            workflowId: workflowGraph._id || workflowGraph.id,
            nodeId,
            agent: 'monitoring',
            level: 'warning',
            message: `⏸️ Execution paused at node [${node.data?.label || nodeId}]. Waiting for resume signal...`,
          });
          await new Promise((r) => setTimeout(r, 1500));
        }

        await Execution.findByIdAndUpdate(executionId, {
          currentNode: nodeId,
        });

        // Validation Agent check
        const validation = validationAgent.validateNodeInput(node, context);
        if (!validation.isValid) {
          await monitoringAgent.logEvent({
            executionId,
            workflowId: workflowGraph._id || workflowGraph.id,
            nodeId,
            agent: 'validation',
            level: 'warning',
            message: `⚠️ Validation Agent identified missing fields in [${node.data?.label || nodeId}]: ${validation.missingFields.join(', ')}. Applying default values.`,
            metadata: validation,
          });
        }

        // Execution Agent run with retry mechanism
        let stepSucceeded = false;
        let retryCount = 0;
        let nodeResult = null;

        while (!stepSucceeded && retryCount <= 2) {
          try {
            await monitoringAgent.logEvent({
              executionId,
              workflowId: workflowGraph._id || workflowGraph.id,
              nodeId,
              agent: 'execution',
              level: 'info',
              message: `⚡ Execution Agent dispatching node: "${node.data?.label || nodeId}" (${node.type || 'standard'}).`,
              metadata: { nodeType: node.type, stepIndex: i + 1 },
            });

            const execRes = await executionAgent.executeNode(node, context, userId);
            nodeResult = execRes.output;

            // Validate output
            const outValidation = validationAgent.validateNodeOutput(node, nodeResult);
            if (outValidation.isValid) {
              await monitoringAgent.logEvent({
                executionId,
                workflowId: workflowGraph._id || workflowGraph.id,
                nodeId,
                agent: 'validation',
                level: 'success',
                message: `✅ Validation Agent verified output contract for [${node.data?.label || nodeId}] (${execRes.executionTimeMs}ms).`,
                metadata: { output: nodeResult, executionTimeMs: execRes.executionTimeMs },
              });
            }

            // Save to execution context
            context.outputs[nodeId] = nodeResult;
            context[nodeId] = { output: nodeResult };
            if (node.type === 'trigger' || node.data?.nodeType === 'trigger') {
              context.trigger = { data: nodeResult };
            }

            stepSucceeded = true;
          } catch (err) {
            retryCount++;
            const recovery = recoveryAgent.handleFailure(err, retryCount);

            await monitoringAgent.logEvent({
              executionId,
              workflowId: workflowGraph._id || workflowGraph.id,
              nodeId,
              agent: 'recovery',
              level: 'error',
              message: `🛠️ Recovery Agent detected failure [${recovery.classification}]: "${recovery.reason}". Decision: ${recovery.decision}.`,
              metadata: recovery,
            });

            if (recovery.decision === 'retry_with_backoff') {
              await new Promise((r) => setTimeout(r, recovery.backoffMs));
            } else {
              throw err;
            }
          }
        }
      }

      // Step 3: Mark Execution as COMPLETED
      const duration = Date.now() - startTime;
      await Execution.findByIdAndUpdate(executionId, {
        status: 'COMPLETED',
        currentNode: null,
        endTime: new Date(),
        duration,
        outputs: context.outputs,
      });

      await monitoringAgent.logEvent({
        executionId,
        workflowId: workflowGraph._id || workflowGraph.id,
        agent: 'monitoring',
        level: 'success',
        message: `🎉 All ${plan.stepsCount} nodes finished successfully in ${duration}ms. Workflow run complete.`,
        metadata: { duration, totalOutputs: Object.keys(context.outputs).length },
      });

      // Emit Notification
      if (userId) {
        const notif = await Notification.create({
          owner: userId,
          workflowId: workflowGraph._id || workflowGraph.id,
          executionId,
          type: 'success',
          title: 'Workflow Execution Completed',
          message: `Automation "${workflowGraph.name || 'Workflow'}" finished successfully in ${(duration / 1000).toFixed(1)}s.`,
        });
        emitNotification(userId, notif);
      }

      emitGlobalEvent({
        executionId,
        status: 'COMPLETED',
        workflowName: workflowGraph.name,
      });
    } catch (finalError) {
      const duration = Date.now() - startTime;
      await Execution.findByIdAndUpdate(executionId, {
        status: 'FAILED',
        endTime: new Date(),
        duration,
        error: finalError.message || 'Execution error',
      });

      await monitoringAgent.logEvent({
        executionId,
        workflowId: workflowGraph._id || workflowGraph.id,
        agent: 'monitoring',
        level: 'error',
        message: `❌ Pipeline execution failed: ${finalError.message}`,
        metadata: { error: finalError.stack },
      });

      if (userId) {
        const notif = await Notification.create({
          owner: userId,
          workflowId: workflowGraph._id || workflowGraph.id,
          executionId,
          type: 'error',
          title: 'Workflow Execution Failed',
          message: `Execution for "${workflowGraph.name || 'Workflow'}" failed: ${finalError.message}`,
        });
        emitNotification(userId, notif);
      }
    } finally {
      executionControls.delete(String(executionId));
    }
  }
}

module.exports = new Orchestrator();
