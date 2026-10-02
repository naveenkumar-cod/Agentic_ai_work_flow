class PlannerAgent {
  async plan(workflowGraph) {
    const nodes = workflowGraph.nodes || [];
    const edges = workflowGraph.edges || [];

    if (nodes.length === 0) {
      return {
        orderedNodeIds: [],
        confidenceScore: 0.0,
        stepsCount: 0,
        dependencies: {},
      };
    }

    // Build in-degree and adjacency list
    const inDegree = {};
    const adj = {};
    const dependencies = {};

    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
      dependencies[n.id] = [];
    });

    edges.forEach((e) => {
      if (adj[e.source] && inDegree[e.target] !== undefined) {
        adj[e.source].push(e.target);
        inDegree[e.target] = (inDegree[e.target] || 0) + 1;
        dependencies[e.target].push(e.source);
      }
    });

    // Kahn's algorithm for topological sort
    const queue = [];
    nodes.forEach((n) => {
      if (inDegree[n.id] === 0) {
        queue.push(n.id);
      }
    });

    const orderedNodeIds = [];
    while (queue.length > 0) {
      const u = queue.shift();
      orderedNodeIds.push(u);

      const neighbors = adj[u] || [];
      for (const v of neighbors) {
        inDegree[v]--;
        if (inDegree[v] === 0) {
          queue.push(v);
        }
      }
    }

    // If there were unreachable or unvisited nodes due to disconnected components, append remaining
    if (orderedNodeIds.length < nodes.length) {
      nodes.forEach((n) => {
        if (!orderedNodeIds.includes(n.id)) {
          orderedNodeIds.push(n.id);
        }
      });
    }

    // Compute plan confidence score based on connectivity and completeness
    const totalEdges = edges.length;
    const isWellConnected = totalEdges >= nodes.length - 1;
    const confidenceScore = isWellConnected ? 0.98 : 0.92;

    return {
      orderedNodeIds,
      confidenceScore,
      stepsCount: orderedNodeIds.length,
      dependencies,
    };
  }
}

module.exports = new PlannerAgent();
