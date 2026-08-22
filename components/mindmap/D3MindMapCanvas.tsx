'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3-hierarchy';
import type { ConceptMindMap, KnowledgeGraph } from '@/lib/mindmap/types';
import {
  buildVisualMindMapModel,
  VisualMindMapModel,
  VisualMindMapNode,
  VisualTreeNode,
} from '@/lib/mindmap/visualMindMapModel';

interface D3MindMapCanvasProps {
  mindMap: ConceptMindMap;
  knowledgeGraph?: KnowledgeGraph;
  className?: string;
  onSelectConceptForRevision?: (conceptTitle: string) => void;
}

export default function D3MindMapCanvas({
  mindMap,
  knowledgeGraph,
  className = '',
  onSelectConceptForRevision,
}: D3MindMapCanvasProps) {
  // 1. Build controlled Visual Mind Map Model from canonical knowledge graph or concept map
  const visualModel = useMemo<VisualMindMapModel>(() => {
    return buildVisualMindMapModel(
      knowledgeGraph || mindMap,
      mindMap.subject,
      mindMap.grade
    );
  }, [mindMap, knowledgeGraph]);

  // State: collapsed node IDs (depth >= 2 collapsed by default)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(() => {
    const initialCollapsed = new Set<string>();
    (Object.values(visualModel.nodes) as VisualMindMapNode[]).forEach((n) => {
      if (n.depth >= 2 && n.childIds.length > 0) {
        initialCollapsed.add(n.id);
      }
    });
    return initialCollapsed;
  });

  // State: active selected concept for the side detail panel
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Zoom & Pan state
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 80, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Selected node metadata
  const selectedNode = selectedNodeId ? visualModel.nodes[selectedNodeId] : null;

  // Toggle node collapse
  const handleToggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Node click: select for detail panel & optionally expand
  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
    // If collapsed, expand on click
    if (collapsedNodes.has(nodeId)) {
      setCollapsedNodes((prev) => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
    }
  };

  // Expand All / Collapse All
  const handleExpandAll = () => setCollapsedNodes(new Set());
  const handleCollapseToLevel1 = () => {
    const next = new Set<string>();
    (Object.values(visualModel.nodes) as VisualMindMapNode[]).forEach((n) => {
      if (n.depth >= 1 && n.childIds.length > 0) next.add(n.id);
    });
    setCollapsedNodes(next);
  };

  // Filter tree data dynamically to respect collapsed nodes
  const filteredTreeData = useMemo<VisualTreeNode>(() => {
    function filterNode(treeNode: VisualTreeNode): VisualTreeNode {
      if (collapsedNodes.has(treeNode.id)) {
        return { ...treeNode, children: undefined };
      }
      return {
        ...treeNode,
        children: treeNode.children ? treeNode.children.map(filterNode) : undefined,
      };
    }
    return filterNode(visualModel.tree);
  }, [visualModel.tree, collapsedNodes]);

  // Compute D3 Tree Layout
  const { layoutNodes, layoutLinks } = useMemo(() => {
    const root = d3.hierarchy<VisualTreeNode>(filteredTreeData);

    // Spacing between nodes: [vertical height, horizontal depth separation]
    const treeLayout = d3.tree<VisualTreeNode>().nodeSize([70, 280]);
    treeLayout(root);

    return {
      layoutNodes: root.descendants(),
      layoutLinks: root.links(),
    };
  }, [filteredTreeData]);

  // Zoom Controls
  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.35, z - 0.15));
  const handleResetZoom = () => {
    setZoom(0.85);
    setPan({ x: 80, y: 300 });
  };

  // Panning Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUpOrLeave = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    setZoom((z) => Math.max(0.35, Math.min(2, z * factor)));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preventScroll = (e: WheelEvent) => e.preventDefault();
    canvas.addEventListener('wheel', preventScroll, { passive: false });
    return () => canvas.removeEventListener('wheel', preventScroll);
  }, []);

  // Filter highlight logic
  const isNodeMatchingSearch = (label: string) => {
    if (!searchQuery.trim()) return true;
    return label.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onWheel={handleWheel}
      className={`relative w-full h-[640px] bg-[#07080b] border border-white/10 rounded-3xl overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-2xl ${className}`}
    >
      {/* ── 1. BACKGROUND GRID ── */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      />

      {/* ── 2. TOP TOOLBAR ── */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-lg">
        {/* Search Input */}
        <div className="relative w-44">
          <span className="absolute left-2.5 top-2 text-white/40 text-xs">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts..."
            className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Viewport Zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/15 transition-all text-sm font-bold cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/15 transition-all text-sm font-bold cursor-pointer"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/15 transition-all text-[11px] font-mono cursor-pointer"
            title="Reset View"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Expand / Collapse Controls */}
        <button
          onClick={handleExpandAll}
          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
        >
          Expand All
        </button>
        <button
          onClick={handleCollapseToLevel1}
          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
        >
          Collapse Deep
        </button>
      </div>

      {/* Top Right Header Badge */}
      <div className="absolute top-4 right-4 z-30 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-2xl flex items-center gap-3 text-xs text-white/80 shadow-lg">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white/90">{visualModel.title}</span>
        </span>
        <span className="text-white/30">&bull;</span>
        <span className="text-[11px] text-white/50">
          {visualModel.visualNodeCount} Concepts ({visualModel.totalKnowledgeNodes} in Graph)
        </span>
      </div>

      {/* ── 3. SVG TREE RENDERING ── */}
      <svg className="w-full h-full block">
        <defs>
          <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Tree Connectors (Bezier curves) */}
          {layoutLinks.map((link, idx) => {
            const from = link.source;
            const to = link.target;
            const isHovered = hoveredNodeId === to.data.id || hoveredNodeId === from.data.id;
            const strokeColor = to.data.color || '#6366f1';

            return (
              <path
                key={idx}
                d={`M ${from.y} ${from.x} C ${(from.y + to.y) / 2} ${from.x}, ${(from.y + to.y) / 2} ${to.x}, ${to.y} ${to.x}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeOpacity={isHovered ? 0.9 : 0.4}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Render Nodes */}
          {layoutNodes.map((layoutNode) => {
            const { x, y, data } = layoutNode;
            const nodeMeta = visualModel.nodes[data.id];
            const isSelected = selectedNodeId === data.id;
            const isHovered = hoveredNodeId === data.id;
            const hasChildren = nodeMeta?.childIds && nodeMeta.childIds.length > 0;
            const isCollapsed = collapsedNodes.has(data.id);
            const matchesSearch = isNodeMatchingSearch(data.label);

            const isRoot = data.depth === 0;
            const isMajor = data.depth === 1;

            // Dimensions
            const cardWidth = isRoot ? 200 : isMajor ? 180 : 160;
            const cardHeight = isRoot ? 48 : isMajor ? 44 : 38;

            return (
              <g
                key={data.id}
                transform={`translate(${y}, ${x})`}
                className={`transition-all duration-200 cursor-pointer ${
                  !matchesSearch ? 'opacity-25' : 'opacity-100'
                }`}
                onMouseEnter={() => setHoveredNodeId(data.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={(e) => handleNodeClick(data.id, e)}
              >
                {/* Node Card Background */}
                <rect
                  x={0}
                  y={-cardHeight / 2}
                  width={cardWidth}
                  height={cardHeight}
                  rx={isRoot ? 24 : 14}
                  fill={
                    isSelected
                      ? '#1e1b4b'
                      : isRoot
                      ? '#0f172a'
                      : isHovered
                      ? '#1e293b'
                      : '#0f172a'
                  }
                  stroke={
                    isSelected
                      ? '#818cf8'
                      : isHovered
                      ? data.color || '#6366f1'
                      : isRoot
                      ? '#3b82f6'
                      : `${data.color || '#6366f1'}66`
                  }
                  strokeWidth={isSelected ? 2.5 : isHovered || isRoot ? 2 : 1.2}
                  className="transition-all duration-200 shadow-md"
                />

                {/* Accent Color Left Strip / Dot */}
                {!isRoot && (
                  <circle
                    cx={12}
                    cy={0}
                    r={isMajor ? 4.5 : 3.5}
                    fill={data.color || '#6366f1'}
                  />
                )}

                {/* Node Label Text */}
                <text
                  x={isRoot ? 16 : 24}
                  y={nodeMeta?.formulas && nodeMeta.formulas.length > 0 && !isRoot ? -3 : 4}
                  fill={isSelected ? '#ffffff' : '#f1f5f9'}
                  fontSize={isRoot ? 13 : isMajor ? 12 : 11}
                  fontWeight={isRoot || isMajor ? 700 : 600}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {data.label.length > 20 ? `${data.label.slice(0, 19)}…` : data.label}
                </text>

                {/* Sub-label / Formula Indicator */}
                {nodeMeta?.formulas && nodeMeta.formulas.length > 0 && !isRoot && (
                  <text
                    x={24}
                    y={11}
                    fill="#94a3b8"
                    fontSize={9}
                    fontFamily="monospace"
                  >
                    📐 {nodeMeta.formulas[0].latex.slice(0, 16)}
                  </text>
                )}

                {/* Expand / Collapse Indicator Button */}
                {hasChildren && (
                  <g
                    transform={`translate(${cardWidth - 16}, 0)`}
                    onClick={(e) => handleToggleCollapse(data.id, e)}
                    className="hover:scale-110 transition-transform"
                  >
                    <circle
                      cx={0}
                      cy={0}
                      r={9}
                      fill={isCollapsed ? data.color || '#6366f1' : '#334155'}
                    />
                    <text
                      x={0}
                      y={3.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={11}
                      fontWeight="bold"
                    >
                      {isCollapsed ? `+` : `−`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* ── 4. SLIDE-OUT CONCEPT DETAIL PANEL ── */}
      {selectedNode && (
        <div className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-white/15 p-6 z-40 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white"
                    style={{ backgroundColor: selectedNode.accentColor || '#3b82f6' }}
                  >
                    {selectedNode.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-white/50">Level {selectedNode.depth}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1.5 leading-snug">
                  {selectedNode.label}
                </h2>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="h-7 w-7 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Definition / Summary */}
            {(selectedNode.definition || selectedNode.summary) && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                  Concept Overview
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
                  {selectedNode.definition || selectedNode.summary}
                </p>
              </div>
            )}

            {/* Mathematical Formulas */}
            {selectedNode.formulas && selectedNode.formulas.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Mathematical Formula
                </span>
                {selectedNode.formulas.map((f, fIdx) => (
                  <div
                    key={fIdx}
                    className="bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl space-y-1"
                  >
                    <div className="text-sm font-mono font-bold text-amber-200">
                      {f.latex}
                    </div>
                    {f.meaning && (
                      <p className="text-[11px] text-amber-300/80">{f.meaning}</p>
                    )}
                    {f.variables && (
                      <p className="text-[10px] text-amber-400/60">{f.variables}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Key Points */}
            {selectedNode.keyPoints && selectedNode.keyPoints.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                  Key Principles
                </span>
                <ul className="space-y-1">
                  {selectedNode.keyPoints.map((kp, kIdx) => (
                    <li
                      key={kIdx}
                      className="text-xs text-slate-300 flex items-start gap-2 bg-white/5 p-2 rounded-lg"
                    >
                      <span className="text-indigo-400 mt-0.5">&bull;</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Algorithm Steps */}
            {selectedNode.steps && selectedNode.steps.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  Sequential Steps
                </span>
                <div className="space-y-1.5">
                  {selectedNode.steps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="text-xs text-slate-300 flex items-start gap-2 bg-cyan-950/20 border border-cyan-500/20 p-2.5 rounded-lg"
                    >
                      <span className="font-mono font-bold text-cyan-400">{sIdx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Provenance */}
            {selectedNode.sourceNodeIds && selectedNode.sourceNodeIds.length > 0 && (
              <div className="text-[10px] text-white/30 pt-2 border-t border-white/5">
                Source Entity: {selectedNode.sourceNodeIds.join(', ')}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            {onSelectConceptForRevision && (
              <button
                onClick={() => onSelectConceptForRevision(selectedNode.label)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📋 View in Revision Sheet</span>
              </button>
            )}
            <button
              onClick={() => setSelectedNodeId(null)}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-all cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
