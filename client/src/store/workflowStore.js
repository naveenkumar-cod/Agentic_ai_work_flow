import { create } from 'zustand';
import api from '../services/api';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

export const useWorkflowStore = create((set, get) => ({
  workflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isDirty: false,
  isSaving: false,
  isLoading: false,
  error: null,

  setWorkflow: (workflow) => {
    set({
      workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNode: null,
      isDirty: false,
      error: null
    });
  },

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, get().edges),
      isDirty: true
    });
  },

  selectNode: (node) => {
    set({ selectedNode: node });
  },

  updateNodeData: (nodeId, dataUpdate) => {
    const updatedNodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        const newData = { ...node.data, ...dataUpdate };
        const updated = { ...node, data: newData };
        if (get().selectedNode?.id === nodeId) {
          set({ selectedNode: updated });
        }
        return updated;
      }
      return node;
    });

    set({ nodes: updatedNodes, isDirty: true });
  },

  addNode: (type, label, position, defaultData = {}) => {
    const id = `node_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
    const newNode = {
      id,
      type: type,
      position: position || { x: 300, y: 200 + get().nodes.length * 50 },
      data: {
        id,
        label: label || type.toUpperCase(),
        nodeType: type,
        description: '',
        config: defaultData,
        status: 'idle'
      }
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNode: newNode,
      isDirty: true
    });

    return newNode;
  },

  deleteNode: (nodeId) => {
    const remainingNodes = get().nodes.filter(n => n.id !== nodeId);
    const remainingEdges = get().edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    set({
      nodes: remainingNodes,
      edges: remainingEdges,
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
      isDirty: true
    });
  },

  fetchWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/workflows/${id}`);
      get().setWorkflow(res.data);
      set({ isLoading: false });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  saveWorkflow: async () => {
    const { workflow, nodes, edges } = get();
    if (!workflow?._id) return;

    set({ isSaving: true });
    try {
      const res = await api.put(`/workflows/${workflow._id}`, {
        nodes,
        edges,
        triggerConfig: workflow.triggerConfig,
        name: workflow.name,
        description: workflow.description
      });
      set({ workflow: res.data, isDirty: false, isSaving: false });
      return res.data;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  }
}));
