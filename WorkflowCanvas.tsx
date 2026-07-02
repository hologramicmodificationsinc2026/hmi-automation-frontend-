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

// ==========================================
// 1. CUSTOM NEON NODE COMPONENTS (INLINED)
// ==========================================

function TriggerNode({ data }: { data: { label: string } }) {
  return (
    <div className="bg-[#141423] border border-[#00f0ff] rounded-xl p-4 min-w-[200px] shadow-[0_0_15px_rgba(0,240,255,0.2)] text-white font-sans text-left relative">
      <Handle type="target" position={Position.Left} className="!bg-[#00f0ff] !w-3 !h-3 !border-2 !border-[#0b0b14]" />
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2 mb-2">
        <div className="p-2 bg-[#00f0ff]/10 rounded-lg text-[#00f0ff]">⚡</div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Webhook</h3>
          <p className="text-sm font-semibold text-white">{data.label || 'Instant Trigger'}</p>
        </div>
      </div>
      <div className="text-[11px] text-slate-400 bg-[#0b0b14] p-2 rounded border border-slate-850 font-mono break-all">
        POST /api/v1/trigger/...
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[#00f0ff] !w-3 !h-3 !border-2 !border-[#0b0b14]" />
    </div>
  );
}

function ActionNode({ data }: { data: { label: string } }) {
  return (
    <div className="bg-[#141423] border border-[#ff007f] rounded-xl p-4 min-w-[200px] shadow-[0_0_15px_rgba(255,0,127,0.2)] text-white font-sans text-left relative">
      <Handle type="target" position={Position.Left} className="!bg-[#ff007f] !w-3 !h-3 !border-2 !border-[#0b0b14]" />
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2 mb-2">
        <div className="p-2 bg-[#ff007f]/10 rounded-lg text-[#ff007f]">⚙️</div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">JavaScript</h3>
          <p className="text-sm font-semibold text-white">{data.label || 'Execute Code'}</p>
        </div>
      </div>
      <div className="text-[11px] text-[#ff007f] bg-[#0b0b14] p-2 rounded border border-slate-850 font-mono opacity-80">
        const output = () =&gt; &#123; ... &#125;
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[#ff007f] !w-3 !h-3 !border-2 !border-[#0b0b14]" />
    </div>
  );
}

const nodeTypes = {
  webhookTrigger: TriggerNode,
  jsAction: ActionNode,
};

// ==========================================
// 2. MAIN WORKFLOW CANVAS DASHBOARD
// ==========================================

const initialNodes = [
  { id: '1', type: 'webhookTrigger', position: { x: 100, y: 200 }, data: { label: 'Production Webhook' } },
  { id: '2', type: 'jsAction', position: { x: 450, y: 200 }, data: { label: 'Clean Payload Data' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00f0ff', strokeWidth: 2 } }
];

export default function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#00f0ff', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="w-full h-screen bg-[#0b0b14] text-white relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-[#141423]/80 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-2xl">
        <h1 className="text-sm font-bold tracking-wider text-slate-200">
          Hologramic Engine <span className="text-[#00f0ff]">v1.0</span>
        </h1>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls className="bg-[#141423] border border-slate-800 text-white fill-white" />
        <MiniMap bgColor="#0b0b14" nodeColor={(n) => n.type === 'webhookTrigger' ? '#00f0ff' : '#ff007f'} />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#2a2a40" />
      </ReactFlow>

      {/* INSPECTOR PANEL */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-[#141423]/95 backdrop-blur-lg border-l border-slate-800 p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20 transition-transform duration-300 ease-in-out ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedNode ? (
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Node Inspector</h2>
                <button onClick={() => setSelectedNode(null)} className="text-xs text-slate-500 hover:text-white transition-colors">✕ Close</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Node ID</label>
                  <div className="text-xs font-mono text-slate-400 bg-[#0b0b14] p-2 rounded border border-slate-850">{selectedNode.id}</div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Type</label>
                  <span className={`text-xs px-2 py-1 rounded font-mono border ${selectedNode.type === 'webhookTrigger' ? 'border-[#00f0ff]/30 text-[#00f0ff] bg-[#00f0ff]/5' : 'border-[#ff007f]/30 text-[#ff007f] bg-[#ff007f]/5'}`}>
                    {selectedNode.type}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Custom Label</label>
                  <input 
                    type="text" 
                    value={selectedNode.data.label as string} 
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newLabel } } : n));
                      setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, label: newLabel } } : null);
                    }}
                    className="w-full text-sm bg-[#0b0b14] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-600 font-mono text-center border-t border-slate-850 pt-4">
              Hologramic Modifications Inc. © 2026
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
