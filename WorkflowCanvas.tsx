"use client";
import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MagicBuildPrompt } from './MagicBuildPrompt';

// ==========================================
// 1. CUSTOM NEON NODE COMPONENTS
// ==========================================
function TriggerNode({ data }: { data: { label: string } }) {
  return (
    <div className="bg-[#141423] border border-[#00f0ff] rounded-xl p-4 min-w-[200px] shadow-[0_0_15px_rgba(0,240,255,0.2)] text-white font-sans text-left relative">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2 mb-2">
        <div className="p-2 bg-[#00f0ff]/10 rounded-lg text-[#00f0ff]">⚡</div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Webhook</h3>
          <p className="text-sm font-semibold text-white">{data.label || 'Instant Trigger'}</p>
        </div>
      </div>
      <div className="text-[11px] text-slate-400 bg-[#0b0b14] p-2 rounded border border-slate-800/50 font-mono break-all">
        GET /api/v1/trigger
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[#00f0ff] !w-3 !h-3 !border-2 !border-[#0b0b14]" />
    </div>
  );
}

function ActionNode({ data }: { data: { label: string; codeTemplate?: string } }) {
  return (
    <div className="bg-[#1a1025] border border-[#ff0080] rounded-xl p-4 min-w-[200px] shadow-[0_0_15px_rgba(255,0,128,0.2)] text-white font-sans text-left relative">
      <Handle type="target" position={Position.Left} className="!bg-[#ff0080] !w-3 !h-3 !border-2 !border-[#1a1025]" />
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2 mb-2">
        <div className="p-2 bg-[#ff0080]/10 rounded-lg text-[#ff0080]">⚙️</div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Script Executor</h3>
          <p className="text-sm font-semibold text-white">{data.label || 'V8 Execution Node'}</p>
        </div>
      </div>
      <div className="text-[11px] text-slate-400 bg-[#0b0b14] p-2 rounded border border-slate-800/50 font-mono max-h-[60px] overflow-hidden text-ellipsis whitespace-nowrap">
        {data.codeTemplate || '// JavaScript context execution'}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[#ff0080] !w-3 !h-3 !border-2 !border-[#1a1025]" />
    </div>
  );
}

const nodeTypes = {
  webhookTrigger: TriggerNode,
  scriptExecutor: ActionNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'webhookTrigger',
    position: { x: 100, y: 200 },
    data: { label: 'Catch Development Hook' },
  },
];

const initialEdges: Edge[] = [];

// ==========================================
// 2. MAIN WORKFLOW CANVAS DASHBOARD
// ==========================================
export default function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // Core AI orchestrator bridging the canvas state with your magic_build backend API
  const handleMagicBuild = async (userPrompt: string) => {
    try {
      const response = await fetch('/api/magic_build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          orgId: 'org_hmi_dev_01' // Context tenant fallback
        }),
      });

      const data = await response.json();

      if (data.success && data.workflow) {
        // Transform and cleanly map layout metrics passed back by OpenAI
        const transformedNodes = data.workflow.nodes.map((n: any) => ({
          id: n.id,
          type: n.type,
          position: n.position || { x: 150, y: 150 },
          data: n.data || { label: 'Generated Step' }
        }));

        const transformedEdges = data.workflow.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          animated: true,
          style: { stroke: '#00f0ff' }
        }));

        setNodes(transformedNodes);
        setEdges(transformedEdges);
      }
    } catch (error) {
      console.error("Error weaving workflow grid:", error);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#0b0b14]">
      {/* Dynamic Floating AI Canvas Prompt Bar */}
      <MagicBuildPrompt onGenerate={handleMagicBuild} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls className="!bg-[#141423] !border-slate-800 !text-white [&_button]:border-slate-800 [&_button]:hover:bg-zinc-800" />
        <MiniMap 
          bgColor="#0b0b14" 
          nodeColor={(node) => (node.type === 'webhookTrigger' ? '#00f0ff' : '#ff0080')}
          maskColor="rgba(0, 0, 0, 0.6)"
          className="border border-slate-800 rounded-lg overflow-hidden"
        />
        <Background variant={BackgroundVariant.Dots} gap={25} size={1} color="#262640" />
      </ReactFlow>
    </div>
  );
}
