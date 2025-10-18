import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { type NodeType } from "@/lib/nodes";
import { AlertCircle, Loader, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface NodePaletteProps {
  onAddNode: (nodeType: NodeType) => void;
  className?: string;
}

export function NodePalette({ onAddNode, className = "" }: NodePaletteProps) {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableNodes();
  }, []);

  const loadAvailableNodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

      const response = await fetch(`${API_URL}/api/nodes/types`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to load nodes: ${response.status} ${errorText}`,
        );
      }

      const data = await response.json();
      setNodes(data.nodes);
      console.log("Available nodes:", data.nodes);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load available nodes";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupNodesByCategory = (nodes: NodeType[]) => {
    const grouped: Record<string, NodeType[]> = {};
    nodes.forEach((node) => {
      if (!grouped[node.category]) {
        grouped[node.category] = [];
      }
      grouped[node.category].push(node);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className={`w-80 bg-card border-r border-border p-4 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading nodes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-80 bg-card border-r border-border p-4 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Failed to load nodes
              </p>
              <p className="text-xs text-muted-foreground mb-3">{error}</p>
              <Button size="sm" variant="outline" onClick={loadAvailableNodes}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupedNodes = groupNodesByCategory(nodes);

  return (
    <div className={`w-80 bg-card border-r border-border ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Nodes</h2>
          <Badge variant="secondary" className="text-xs">
            {nodes.length} available
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Drag or click to add to workflow
        </p>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
        {Object.entries(groupedNodes).map(([category, categoryNodes]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
              {category}
            </h3>

            <div className="space-y-2">
              {categoryNodes.map((node) => (
                <Card
                  key={node.type}
                  className="hover:bg-accent/50 transition-colors cursor-pointer border border-border"
                  onClick={() => onAddNode(node)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-md text-lg">
                        {node.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {node.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {node.description}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {nodes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No nodes available</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={loadAvailableNodes}
          className="w-full"
        >
          Refresh Nodes
        </Button>
      </div>
    </div>
  );
}
