import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import customNodeTypes from './CustomNodes';
import { useWorkflowStore } from '../../store/workflowStore';

function CanvasInternal({ readOnly = false }) {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    addNode
  } = useWorkflowStore();

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (readOnly) return;

      const type = event.dataTransfer.getData('application/agentflow-node-type');
      const label = event.dataTransfer.getData('application/agentflow-node-label');

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, label, position);
    },
    [readOnly, screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback(
    (_, node) => {
      selectNode(node);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={customNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 }
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
        <Controls className="!bg-[#0f172a] !border-slate-700" />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor="#4f46e5"
          maskColor="rgba(9, 13, 22, 0.85)"
          className="!bg-[#0c1220] !border-slate-800 rounded-xl overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowCanvas(props) {
  return (
    <ReactFlowProvider>
      <CanvasInternal {...props} />
    </ReactFlowProvider>
  );
}
