import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

interface SpiderConsoleProps {
  logs: { id: string; message: string; type: "info" | "success" | "error" }[];
}

export const SpiderConsole = ({ logs }: SpiderConsoleProps) => {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🕷️</span>
        <h2 className="text-lg font-bold text-glow-accent font-orbitron">Spider Console</h2>
      </div>
      <div
        ref={consoleRef}
        className="bg-[hsl(var(--console-bg))] border-2 border-accent/30 rounded-lg p-4 h-32 overflow-y-auto font-mono text-sm box-glow-accent"
      >
        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`mb-1 ${
                log.type === "success"
                  ? "text-secondary"
                  : log.type === "error"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              <span className="text-accent mr-2">&gt;</span>
              {log.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
