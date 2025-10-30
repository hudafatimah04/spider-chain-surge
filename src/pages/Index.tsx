import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VisualizationCanvas } from "@/components/VisualizationCanvas";
import { SpiderConsole } from "@/components/SpiderConsole";
import { Play, Zap, Split, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface Node {
  id: number;
  next: number | null;
}

interface LogEntry {
  id: string;
  message: string;
  type: "info" | "success" | "error";
}

const Index = () => {
  const [initialized, setInitialized] = useState(false);
  const [nodeCount, setNodeCount] = useState("");
  const [chains, setChains] = useState<Node[][]>([]);
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "init", message: "🕸️ Spider-Verse Web Merge Visualizer", type: "success" },
    { id: "ready", message: "Enter number of nodes to begin", type: "info" },
  ]);
  const [highlightedChain, setHighlightedChain] = useState<number | null>(null);
  const [animatingConnection, setAnimatingConnection] = useState<{ from: number; to: number } | null>(null);

  const initializeNodes = () => {
    const count = parseInt(nodeCount);
    if (isNaN(count) || count < 1 || count > 20) {
      toast.error("Please enter a number between 1 and 20");
      return;
    }

    const newChains: Node[][] = [];
    for (let i = 1; i <= count; i++) {
      newChains.push([{ id: i, next: null }]);
    }

    setChains(newChains);
    setInitialized(true);
    setLogs([
      { id: "init", message: `🕸️ Initialized ${count} nodes`, type: "success" },
      { id: "ready", message: "Ready for commands: LINK, SPLIT, REPORT", type: "info" },
    ]);
    toast.success(`${count} nodes created!`);
  };

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    setLogs((prev) => [...prev, { id: Date.now().toString(), message, type }]);
  };

  const findChainWithNode = (nodeId: number): number => {
    return chains.findIndex((chain) => chain.some((node) => node.id === nodeId));
  };

  const executeLink = (nodeA: number, nodeB: number) => {
    const chainAIndex = findChainWithNode(nodeA);
    const chainBIndex = findChainWithNode(nodeB);

    if (chainAIndex === -1 || chainBIndex === -1) {
      addLog(`❌ Error: Node ${nodeA} or ${nodeB} not found`, "error");
      toast.error("Node not found");
      return;
    }

    if (chainAIndex === chainBIndex) {
      addLog(`❌ Error: Nodes already in same chain`, "error");
      toast.error("Nodes in same chain");
      return;
    }

    // Find tail of chain A
    const chainA = chains[chainAIndex].map(n => ({ ...n }));
    const chainB = chains[chainBIndex].map(n => ({ ...n }));
    const tailNode = chainA[chainA.length - 1];
    
    // Animate connection
    setAnimatingConnection({ from: tailNode.id, to: chainB[0].id });
    
    setTimeout(() => {
      // Connect tail to first node of chain B
      tailNode.next = chainB[0].id;
      const mergedChain = [...chainA, ...chainB];
      
      setChains((prev) => {
        const newChains = prev.filter((_, i) => i !== chainAIndex && i !== chainBIndex);
        return [...newChains, mergedChain];
      });

      addLog(`🕸️ LINK: Connected ${chainA.map(n => n.id).join('→')} to ${chainB.map(n => n.id).join('→')}`, "success");
      toast.success("Chains merged!");
      setAnimatingConnection(null);
    }, 1000);
  };

  const executeSplit = (nodeId: number) => {
    const chainIndex = findChainWithNode(nodeId);
    if (chainIndex === -1) {
      addLog(`❌ Error: Node ${nodeId} not found`, "error");
      toast.error("Node not found");
      return;
    }

    const chain = chains[chainIndex];
    const nodeIndex = chain.findIndex((n) => n.id === nodeId);

    if (nodeIndex === chain.length - 1) {
      addLog(`❌ Error: Cannot split after last node`, "error");
      toast.error("Cannot split at tail");
      return;
    }

    const updatedNode = { ...chain[nodeIndex], next: null };
    const firstPart = [...chain.slice(0, nodeIndex), updatedNode];
    const secondPart = chain.slice(nodeIndex + 1);

    setChains((prev) => {
      const newChains = [...prev];
      newChains[chainIndex] = firstPart;
      return [...newChains, secondPart];
    });

    addLog(`⚡ SPLIT: Chain broken after node ${nodeId}`, "success");
    toast.success("Chain split!");
  };

  const executeReport = (nodeId: number) => {
    const chainIndex = findChainWithNode(nodeId);
    if (chainIndex === -1) {
      addLog(`❌ Error: Node ${nodeId} not found`, "error");
      toast.error("Node not found");
      return;
    }

    setHighlightedChain(chainIndex);
    const chain = chains[chainIndex];
    const sequence = chain.map((n) => n.id).join(" → ");
    addLog(`📊 REPORT: Chain containing ${nodeId}: [${sequence}]`, "success");
    toast.success("Chain highlighted!");

    setTimeout(() => setHighlightedChain(null), 3000);
  };

  const handleCommand = () => {
    const parts = command.trim().toUpperCase().split(" ");
    const cmd = parts[0];

    addLog(`> ${command}`, "info");

    if (cmd === "LINK" && parts.length === 3) {
      executeLink(parseInt(parts[1]), parseInt(parts[2]));
    } else if (cmd === "SPLIT" && parts.length === 2) {
      executeSplit(parseInt(parts[1]));
    } else if (cmd === "REPORT" && parts.length === 2) {
      executeReport(parseInt(parts[1]));
    } else {
      addLog("❌ Invalid command. Use: LINK <a> <b>, SPLIT <x>, REPORT <x>", "error");
      toast.error("Invalid command");
    }

    setCommand("");
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <motion.h1
          className="text-4xl md:text-5xl font-black text-center mb-2 text-glow font-orbitron"
          animate={{ 
            textShadow: [
              "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)",
              "0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--primary) / 0.7)",
              "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🕸️ Spider-Verse Web Merge
        </motion.h1>
        <p className="text-center text-muted-foreground mb-8 font-mono">
          Dynamic Linked List Operations Visualizer
        </p>

        {/* Initialization */}
        {!initialized ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto mb-8 p-6 border-2 border-primary/30 rounded-lg bg-card/50 backdrop-blur-sm box-glow"
          >
            <h2 className="text-xl font-bold text-center mb-4 text-primary">Initialize Nodes</h2>
            <div className="flex gap-3">
              <Input
                type="number"
                value={nodeCount}
                onChange={(e) => setNodeCount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && initializeNodes()}
                placeholder="Enter number of nodes (1-20)"
                className="flex-1 bg-input border-accent/40 font-mono"
                min="1"
                max="20"
              />
              <Button
                onClick={initializeNodes}
                className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold box-glow font-orbitron"
              >
                Create
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Canvas */}
            <VisualizationCanvas
              chains={chains}
              highlightedChain={highlightedChain}
              animatingConnection={animatingConnection}
            />

        {/* Command Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-4xl mx-auto mt-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCommand()}
              placeholder="Enter command (e.g. LINK 1 4, SPLIT 2, REPORT 3)"
              className="flex-1 bg-input border-accent/40 text-foreground font-mono focus:border-secondary focus:ring-secondary box-glow-secondary"
            />
            <Button
              onClick={handleCommand}
              className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold box-glow gap-2 font-orbitron"
            >
              <Play className="w-4 h-4" />
              Run
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommand("LINK 3 4")}
              className="gap-2 border-secondary/50 text-secondary hover:bg-secondary/10 font-mono"
            >
              <LinkIcon className="w-3 h-3" />
              LINK
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommand("SPLIT 2")}
              className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 font-mono"
            >
              <Split className="w-3 h-3" />
              SPLIT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommand("REPORT 1")}
              className="gap-2 border-accent/50 text-accent hover:bg-accent/10 font-mono"
            >
              <Zap className="w-3 h-3" />
              REPORT
            </Button>
          </div>
        </motion.div>

            {/* Console */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SpiderConsole logs={logs} />
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Index;
