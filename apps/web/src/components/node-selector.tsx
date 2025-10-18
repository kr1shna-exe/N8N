import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { type NodeType } from "@/lib/nodes";
import {
  AlertCircle,
  Globe,
  Loader,
  Plus,
  Search,
  Settings,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NodeSelectorProps {
  onAddNode: (nodeType: NodeType) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NodeSelector({
  onAddNode,
  trigger,
  open: externalOpen,
  onOpenChange,
}: NodeSelectorProps) {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableNodes();
  }, []);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const loadAvailableNodes = async () => {
    try {
      setLoading(true);
      setError(null);

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

  const categorizeNodes = (nodes: NodeType[]) => {
    const triggers: NodeType[] = [];
    const regularNodes: NodeType[] = [];
    const manualTrigger: NodeType = {
      type: "manual",
      name: "Manual Trigger",
      description: "Manually trigger the workflow",
      category: "Triggers",
      icon: "▶️",
    };
    const webhookTrigger: NodeType = {
      type: "webhook",
      name: "Webhook",
      description: "Trigger workflow via HTTP webhook",
      category: "Triggers",
      icon: "🔗",
    };

    triggers.push(manualTrigger, webhookTrigger);

    nodes.forEach((node) => {
      if (node.category === "Triggers" && node.type !== "form") {
        triggers.push(node);
      } else {
        regularNodes.push(node);
      }
    });

    return { triggers, regularNodes };
  };

  const { triggers, regularNodes } = categorizeNodes(nodes);

  const filteredTriggers = triggers.filter(
    (node) =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredNodes = regularNodes.filter(
    (node) =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleNodeSelect = (nodeType: NodeType) => {
    onAddNode(nodeType);
    setOpen(false);
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const getNodeIcon = (node: NodeType) => {
    switch (node.type) {
      case "telegram":
        return "📱";
      case "email":
        return "📧";
      case "form":
        return "📝";
      case "manual":
        return <Zap className="w-5 h-5" />;
      case "webhook":
        return <Globe className="w-5 h-5" />;
      default:
        return node.icon || <Settings className="w-5 h-5" />;
    }
  };

  const renderMainCategories = () => (
    <div className="space-y-3">
      <Card
        className="hover:bg-accent/50 transition-colors cursor-pointer border-2 hover:border-primary/50"
        onClick={() => setSelectedCategory("triggers")}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Trigger
              </h3>
              <p className="text-sm text-muted-foreground">
                Start your workflow with a trigger
              </p>
              <div className="flex gap-1 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {triggers.length} available
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="hover:bg-accent/50 transition-colors cursor-pointer border-2 hover:border-primary/50"
        onClick={() => setSelectedCategory("nodes")}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Node
              </h3>
              <p className="text-sm text-muted-foreground">
                Add functionality to your workflow
              </p>
              <div className="flex gap-1 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {regularNodes.length} available
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNodeList = (nodeList: NodeType[], title: string) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className="p-1"
        >
          ←
        </Button>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {nodeList.map((node) => (
          <Card
            key={node.type}
            className="hover:bg-accent/50 transition-colors cursor-pointer border"
            onClick={() => handleNodeSelect(node)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg text-lg">
                  {getNodeIcon(node)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">
                    {node.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {node.description}
                  </p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {nodeList.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No {title.toLowerCase()} found
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {trigger || (
            <Button size="sm" className="rounded-full w-8 h-8 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-2">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading nodes...</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (error) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {trigger || (
            <Button size="sm" className="rounded-full w-8 h-8 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Failed to load nodes
                </p>
                <p className="text-xs text-muted-foreground mb-3">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadAvailableNodes}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {trigger || (
            <Button size="sm" className="rounded-full w-8 h-8 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
          <div className="p-4">
            {selectedCategory === null && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    What happens next?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose a trigger to start or a node to continue your
                    workflow
                  </p>
                </div>
                {renderMainCategories()}
              </>
            )}

            {selectedCategory === "triggers" &&
              renderNodeList(filteredTriggers, "Trigger")}

            {selectedCategory === "nodes" &&
              renderNodeList(filteredNodes, "Node")}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
