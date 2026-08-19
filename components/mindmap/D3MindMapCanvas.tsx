'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3-hierarchy';
import type { ConceptMindMap, MindMapSection, MindMapItem } from '@/lib/mindmap/types';

interface D3MindMapCanvasProps {
  mindMap: ConceptMindMap;
  className?: string;
}

interface TreeNodeData {
  id: string;
  name: string;
  type: 'root' | 'section' | 'concept' | 'definition' | 'formula' | 'process' | 'table' | 'key_point' | 'example';
  color?: string;
  details?: string;
  children?: TreeNodeData[];
}

const ACCENT_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f97316',
  purple: '#a855f7',
  red: '#ef4444',
  teal: '#14b8a6',
};

export default function D3MindMapCanvas({
  mindMap,
  className = '',
}: D3MindMapCanvasProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Zoom and Pan states
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 100, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Toggle node collapse state
  const handleNodeClick = (nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
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

  // Convert raw ConceptMindMap into strict hierarchical tree data
  const rawTreeData = useMemo<TreeNodeData>(() => {
    // Map items recursively
    function mapItem(item: MindMapItem, color: string): TreeNodeData {
      return {
        id: item.id,
        name: item.content || item.title || 'Concept',
        type: item.type as any,
        color,
        details: item.details,
        children: item.children ? item.children.map((c) => mapItem(c, color)) : undefined,
      };
    }

    const sections = mindMap.sections.map((sec) => {
      const color = ACCENT_COLORS[sec.accentColor] || '#3b82f6';
      
      const children: TreeNodeData[] = [];

      // Add definition if present
      if (sec.definition) {
        children.push({
          id: `${sec.id}-def`,
          name: sec.definition,
          type: 'definition',
          color,
        });
      }

      // Add formulas if present
      if (sec.formulas && sec.formulas.length > 0) {
        sec.formulas.forEach((f, idx) => {
          children.push({
            id: `${sec.id}-form-${idx}`,
            name: f.latex,
            type: 'formula',
            color,
            details: f.variables || f.meaning,
          });
        });
      }

      // Map inner items
      if (sec.items) {
        sec.items.forEach((item) => {
          children.push(mapItem(item, color));
        });
      }

      return {
        id: sec.id,
        name: sec.title,
        type: 'section' as const,
        color,
        details: sec.summary,
        children: children.length > 0 ? children : undefined,
      };
    });

    return {
      id: 'root-node',
      name: mindMap.title,
      type: 'root' as const,
      color: '#ffffff',
      details: mindMap.summary,
      children: sections,
    };
  }, [mindMap]);

  // Filter tree data dynamically to respect collapsed nodes
  const filteredTreeData = useMemo(() => {
    function filterNode(node: TreeNodeData): TreeNodeData {
      if (collapsedNodes.has(node.id)) {
        return { ...node, children: undefined };
      }
      return {
        ...node,
        children: node.children ? node.children.map(filterNode) : undefined,
      };
    }
    return filterNode(rawTreeData);
  }, [rawTreeData, collapsedNodes]);

  // Compute layout coordinates using d3-hierarchy tree layout
  const { nodes, links } = useMemo(() => {
    const root = d3.hierarchy(filteredTreeData);
    
    // Width and height spacing between hierarchy nodes
    const treeLayout = d3.tree<TreeNodeData>().nodeSize([65, 260]);
    treeLayout(root);

    return {
      nodes: root.descendants(),
      links: root.links(),
    };
  }, [filteredTreeData]);

  // Zoom Controls
  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, z - 0.15));
  const handleResetZoom = () => {
    setZoom(0.85);
    setPan({ x: 100, y: 300 });
  };

  // Panning Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click drag
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

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    setZoom((z) => Math.max(0.4, Math.min(2, z * factor)));
  };

  // Prevent scroll propagation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener('wheel', preventScroll, { passive: false });
    return () => canvas.removeEventListener('wheel', preventScroll);
  }, []);

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onWheel={handleWheel}
      className={`relative w-full h-[620px] bg-[#0b0c10] border border-white/10 rounded-[2rem] overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-2xl ${className}`}
    >
      {/* Dynamic Background Star Field grid */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      />

      {/* Floating Canvas Controls */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-2.5 bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-3 rounded-2xl">
        <div className="text-[10px] text-white/50 font-extrabold uppercase tracking-widest border-b border-white/10 pb-1.5 mb-1 text-left">
          Viewport
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/15 transition-all text-sm font-bold cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/15 transition-all text-sm font-bold cursor-pointer"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2.5 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/90 hover:bg-white/15 transition-all text-xs font-mono font-bold cursor-pointer"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-30 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-4 text-xs font-semibold text-white/80">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] animate-pulse" />
          <span>Interactive Mind Map Canvas</span>
        </span>
        <span className="text-white/40">|</span>
        <span className="text-[11px] text-white/50">Click node to expand/collapse</span>
      </div>

      {/* Primary SVG Rendering Canvas */}
      <svg className="w-full h-full block">
        {/* Glow Filters */}
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Curved Bezier Connectors */}
          {links.map((link, idx) => {
            const from = link.source;
            const to = link.target;
            const strokeColor = to.data.color || '#3b82f6';
            const isHovered = hoveredNodeId === to.data.id || hoveredNodeId === from.data.id;

            return (
              <path
                key={idx}
                d={`M ${from.y} ${from.x} C ${(from.y + to.y) / 2} ${from.x}, ${(from.y + to.y) / 2} ${to.x}, ${to.y} ${to.x}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeOpacity={isHovered ? 0.95 : 0.4}
                filter={isHovered ? 'url(#neon-glow)' : 'none'}
                transition-all="true"
                className="transition-all duration-300"
              />
            );
          })}

          {/* Interactive SVG Node Cards */}
          {nodes.map((node) => {
            const { x, y, data } = node;
            const isHovered = hoveredNodeId === data.id;
            const isCollapsed = collapsedNodes.has(data.id);
            const hasChildren = rawTreeData.children?.some(
              (s) => s.id === data.id && (s.children && s.children.length > 0)
            ) || data.children && data.children.length > 0;

            const accentColor = data.color || '#3b82f6';

            // Determine size based on hierarchy level
            const isRoot = data.type === 'root';
            const isSection = data.type === 'section';
            const isFormula = data.type === 'formula';
            
            const cardWidth = isRoot ? 190 : isSection ? 170 : 160;
            const cardHeight = isRoot ? 54 : isSection ? 48 : 42;

            return (
              <g
                key={data.id}
                transform={`translate(${y - cardWidth / 2}, ${x - cardHeight / 2})`}
                onMouseEnter={() => setHoveredNodeId(data.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={(e) => hasChildren && handleNodeClick(data.id, e)}
                className={`transition-all duration-300 ${hasChildren ? 'cursor-pointer' : ''}`}
              >
                {/* Neon glow hover background */}
                {isHovered && (
                  <rect
                    width={cardWidth}
                    height={cardHeight}
                    rx={isRoot ? 18 : 12}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={4}
                    opacity={0.3}
                    filter="url(#neon-glow)"
                  />
                )}

                {/* Node Glass Card Body */}
                <rect
                  width={cardWidth}
                  height={cardHeight}
                  rx={isRoot ? 18 : 12}
                  fill={isRoot ? '#1e293b' : 'rgba(255, 255, 255, 0.04)'}
                  stroke={isHovered ? accentColor : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth={isRoot ? 2.5 : 1.2}
                  backdrop-filter="blur(16px)"
                  className="transition-all duration-200"
                />

                {/* Left Accent indicator line */}
                {!isRoot && (
                  <path
                    d={`M 1.5 8 L 1.5 ${cardHeight - 8}`}
                    stroke={accentColor}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                )}

                {/* Expand / Collapse Indicator Ring */}
                {hasChildren && (
                  <g transform={`translate(${cardWidth}, ${cardHeight / 2})`}>
                    <circle
                      r={7}
                      fill="#0b0c10"
                      stroke={accentColor}
                      strokeWidth={1.5}
                    />
                    <path
                      d={isCollapsed ? 'M -4 0 L 4 0 M 0 -4 L 0 4' : 'M -4 0 L 4 0'}
                      stroke={accentColor}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                  </g>
                )}

                {/* Text Content & Labels */}
                <foreignObject
                  x={10}
                  y={4}
                  width={cardWidth - 20}
                  height={cardHeight - 8}
                  className="pointer-events-none select-none overflow-hidden"
                >
                  <div className="w-full h-full flex flex-col justify-center text-left leading-tight">
                    {isRoot && (
                      <span className="text-[8px] text-white/50 uppercase tracking-widest font-extrabold mb-0.5">
                        COURSE CHAPTER
                      </span>
                    )}
                    {isSection && (
                      <span className="text-[8px] uppercase tracking-widest font-bold mb-0.5" style={{ color: accentColor }}>
                        CONCEPT SECTION
                      </span>
                    )}
                    <h3
                      className={`text-white font-sans truncate ${
                        isRoot
                          ? 'text-xs font-black'
                          : isSection
                          ? 'text-[11px] font-extrabold'
                          : 'text-[10px] font-semibold text-white/90'
                      }`}
                    >
                      {data.name}
                    </h3>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
