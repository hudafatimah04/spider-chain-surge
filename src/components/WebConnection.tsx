import { motion } from "framer-motion";

interface WebConnectionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isHighlighted?: boolean;
  isAnimating?: boolean;
}

export const WebConnection = ({ x1, y1, x2, y2, isHighlighted, isAnimating }: WebConnectionProps) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 - 40;
  
  const path = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
  
  return (
    <g>
      {/* Glow layer */}
      <motion.path
        d={path}
        fill="none"
        stroke={isHighlighted ? "hsl(var(--active-chain))" : "hsl(var(--web-line))"}
        strokeWidth={isHighlighted ? 4 : 3}
        opacity={0.4}
        filter="blur(4px)"
        initial={{ pathLength: 0 }}
        animate={{ 
          pathLength: 1,
          opacity: isHighlighted ? [0.4, 0.8, 0.4] : 0.4
        }}
        transition={{ 
          pathLength: { duration: 0.6, ease: "easeInOut" },
          opacity: { duration: 1, repeat: isHighlighted ? Infinity : 0 }
        }}
      />
      
      {/* Main web line */}
      <motion.path
        d={path}
        fill="none"
        stroke={isHighlighted ? "hsl(var(--active-chain))" : "hsl(var(--accent))"}
        strokeWidth={2}
        strokeDasharray={isAnimating ? "10 5" : "0"}
        initial={{ pathLength: 0 }}
        animate={{ 
          pathLength: 1,
          strokeDashoffset: isAnimating ? [0, -100] : 0
        }}
        transition={{ 
          pathLength: { duration: 0.6, ease: "easeInOut" },
          strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" }
        }}
      />
      
      {/* Animated flow dots */}
      {isAnimating && (
        <>
          <motion.circle
            r={3}
            fill="hsl(var(--portal-flash))"
            initial={{ offsetDistance: "0%", opacity: 0 }}
            animate={{ 
              offsetDistance: "100%",
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ offsetPath: `path('${path}')` } as any}
          />
          <motion.circle
            r={3}
            fill="hsl(var(--secondary))"
            initial={{ offsetDistance: "0%", opacity: 0 }}
            animate={{ 
              offsetDistance: "100%",
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: 0.5,
              ease: "linear"
            }}
            style={{ offsetPath: `path('${path}')` } as any}
          />
        </>
      )}
    </g>
  );
};
