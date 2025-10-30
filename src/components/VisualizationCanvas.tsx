import { motion } from "framer-motion";
import { NodeVisual } from "./NodeVisual";
import { WebConnection } from "./WebConnection";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Node {
  id: number;
  next: number | null;
}

interface VisualizationCanvasProps {
  chains: Node[][];
  highlightedChain: number | null;
  animatingConnection: { from: number; to: number } | null;
}

export const VisualizationCanvas = ({ 
  chains, 
  highlightedChain,
  animatingConnection 
}: VisualizationCanvasProps) => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const getNodePosition = (nodeId: number, nodeIndex: number, chainLength: number) => {
    const canvasWidth = 800;
    const canvasHeight = 400;
    const rowHeight = 80;
    const nodeSpacing = Math.min(120, (canvasWidth - 100) / Math.max(chainLength, 1));
    const chainStartX = (canvasWidth - (chainLength - 1) * nodeSpacing) / 2;
    
    return {
      x: chainStartX + nodeIndex * nodeSpacing,
      y: nodeId * rowHeight,
    };
  };

  // Calculate dynamic height based on max node ID
  const maxNodeId = Math.max(...chains.flat().map(n => n.id), 0);
  const dynamicHeight = Math.max(400, (maxNodeId + 1) * 80 + 50);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ScrollArea className="h-[400px] border-2 border-accent/20 rounded-lg">
        <motion.svg
          width="100%"
          height={dynamicHeight}
          viewBox={`0 0 800 ${dynamicHeight}`}
          className="bg-card/30 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
        {/* Background pattern */}
        <defs>
          <pattern id="web-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path
              d="M 0 25 L 50 25 M 25 0 L 25 50"
              stroke="hsl(var(--accent))"
              strokeWidth="0.5"
              opacity="0.1"
            />
          </pattern>
        </defs>
        <rect width="800" height={dynamicHeight} fill="url(#web-grid)" />

        {/* Draw connections first (behind nodes) */}
        {chains.map((chain, chainIndex) =>
          chain.map((node, nodeIndex) => {
            if (node.next !== null) {
              const nextNodeIndex = chain.findIndex((n) => n.id === node.next);
              if (nextNodeIndex !== -1) {
                const pos1 = getNodePosition(node.id, nodeIndex, chain.length);
                const pos2 = getNodePosition(node.next, nextNodeIndex, chain.length);
                const isHighlighted = highlightedChain === chainIndex;
                const isAnimating = 
                  animatingConnection?.from === node.id && 
                  animatingConnection?.to === node.next;
                
                return (
                  <WebConnection
                    key={`${node.id}-${node.next}`}
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    isHighlighted={isHighlighted}
                    isAnimating={isAnimating}
                  />
                );
              }
            }
            return null;
          })
        )}

        {/* Draw nodes */}
        {chains.map((chain, chainIndex) =>
          chain.map((node, nodeIndex) => {
            const pos = getNodePosition(node.id, nodeIndex, chain.length);
            const isHighlighted = highlightedChain === chainIndex;
            const isActive = hoveredNode === node.id;
            
            return (
              <NodeVisual
                key={node.id}
                id={node.id}
                x={pos.x}
                y={pos.y}
                isHighlighted={isHighlighted}
                isActive={isActive}
                onHover={setHoveredNode}
              />
            );
          })
        )}
        </motion.svg>
      </ScrollArea>
    </div>
  );
};
