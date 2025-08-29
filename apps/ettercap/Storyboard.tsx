import React, { useState } from 'react';

type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
};

type Edge = {
  from: string;
  to: string;
  color?: string;
  dashed?: boolean;
};

const nodes: Node[] = [
  { id: 'victim', x: 50, y: 160, label: 'Victim' },
  { id: 'router', x: 200, y: 160, label: 'Router' },
  { id: 'attacker', x: 125, y: 40, label: 'Attacker' },
  { id: 'dns', x: 350, y: 40, label: 'DNS' },
  { id: 'fake', x: 350, y: 160, label: 'Fake Site' },
];

const stages: { label: string; edges: Edge[] }[] = [
  {
    label: 'Normal traffic',
    edges: [
      { from: 'victim', to: 'router' },
      { from: 'router', to: 'victim' },
      { from: 'router', to: 'dns' },
      { from: 'dns', to: 'router' },
    ],
  },
  {
    label: 'ARP poison',
    edges: [
      { from: 'victim', to: 'attacker', color: 'red' },
      { from: 'attacker', to: 'router', color: 'red' },
      { from: 'router', to: 'attacker', color: 'red' },
      { from: 'attacker', to: 'victim', color: 'red' },
      { from: 'router', to: 'dns' },
      { from: 'dns', to: 'router' },
    ],
  },
  {
    label: 'DNS spoof',
    edges: [
      { from: 'victim', to: 'attacker', color: 'red' },
      { from: 'attacker', to: 'victim', color: 'red', dashed: true },
      { from: 'victim', to: 'fake', color: 'red' },
    ],
  },
];

const NODE_RADIUS = 20;

const getNode = (id: string) => nodes.find((n) => n.id === id)!;

export default function Storyboard() {
  const [stageIndex, setStageIndex] = useState(0);
  const stage = stages[stageIndex];

  const next = () => setStageIndex((i) => Math.min(i + 1, stages.length - 1));
  const prev = () => setStageIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="flex flex-col items-center space-y-4">
      <svg width={400} height={200} className="border rounded">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>
        {stage.edges.map((e, i) => {
          const from = getNode(e.from);
          const to = getNode(e.to);
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={e.color || 'black'}
              strokeWidth={2}
              strokeDasharray={e.dashed ? '4 2' : undefined}
              markerEnd="url(#arrow)"
            />
          );
        })}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={NODE_RADIUS} fill="white" stroke="black" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex items-center space-x-2">
        <button onClick={prev} disabled={stageIndex === 0} className="px-2 py-1 border rounded">
          Prev
        </button>
        <span>{stage.label}</span>
        <button
          onClick={next}
          disabled={stageIndex === stages.length - 1}
          className="px-2 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
