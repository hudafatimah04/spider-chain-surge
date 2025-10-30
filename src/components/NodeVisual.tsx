import { motion } from "framer-motion";

interface NodeVisualProps {
  id: number;
  x: number;
  y: number;
  isHighlighted?: boolean;
  isActive?: boolean;
  onHover?: (id: number | null) => void;
}

export const NodeVisual = ({ id, x, y, isHighlighted, isActive, onHover }: NodeVisualProps) => {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        filter: isHighlighted 
          ? "drop-shadow(0 0 16px hsl(var(--active-chain))) drop-shadow(0 0 32px hsl(var(--active-chain) / 0.6))"
          : "drop-shadow(0 0 8px hsl(var(--node-glow))) drop-shadow(0 0 20px hsl(var(--node-glow) / 0.4))"
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.15 }}
      transition={{ duration: 0.3, type: "spring" }}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
      style={{ cursor: "pointer" }}
    >
      {/* Outer glow ring */}
      <motion.circle
        cx={x}
        cy={y}
        r={28}
        fill="none"
        stroke={isHighlighted ? "hsl(var(--active-chain))" : "hsl(var(--node-glow))"}
        strokeWidth={1.5}
        opacity={0.3}
        animate={isActive ? {
          r: [28, 35, 28],
          opacity: [0.3, 0.6, 0.3],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Main node body */}
      <circle
        cx={x}
        cy={y}
        r={22}
        fill="hsl(var(--node-core))"
        stroke={isHighlighted ? "hsl(var(--active-chain))" : "hsl(var(--secondary))"}
        strokeWidth={2}
      />
      
      {/* Inner highlight */}
      <circle
        cx={x - 6}
        cy={y - 6}
        r={6}
        fill="hsl(var(--secondary) / 0.6)"
      />
      
      {/* Node ID text */}
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize="14"
        fontWeight="bold"
        fontFamily="JetBrains Mono, monospace"
      >
        {id}
      </text>
    </motion.g>
  );
};
