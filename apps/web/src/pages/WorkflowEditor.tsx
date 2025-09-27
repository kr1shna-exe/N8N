import { CustomNode } from "@/components/custom-node";
import { NodeConfigurationDialog } from "@/components/node-configuration-dialog";
import { NodeSelector } from "@/components/node-selector";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { executionService } from "@/lib/executions";
import type { NodeType } from "@/lib/nodes";
import { workflowService } from "@/lib/workflows";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  EdgeChange,
  NodeChange,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Play, Plus, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Node {
  id: string;
  type?: string;
  data: {
    label?: string;
    nodeType?: string;
    icon?: string;
    description?: string;
    config?: {
      credentialId: string;
      template: Record<string, any>;
    };
    configured?: boolean;
  };
  position: { x: number; y: number };
  className?: string;
  style?: Record<string, unknown>;
}

interface Edge {
  id?: string;
  source?: string;
  target?: string;
}

const initialEdges: Edge[] = [];
const nodeTypes = {
  custom: CustomNode,
};
const WorkflowEditor = () => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [nodeSelectorOpen, setNodeSelectorOpen] = useState(false);
  const [nodeConfigOpen, setNodeConfigOpen] = useState(false);
  const [selectedNodeForConfig, setSelectedNodeForConfig] =
    useState<Node | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState("Untitled Workflow");
  const { workflowId } = useParams();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Only show configuration for configurable nodes
    const configurableNodeTypes = ["telegram", "email", "form", "webhook", "agent"];
    const nodeType = node.data.nodeType as string;

    if (configurableNodeTypes.includes(nodeType)) {
      setSelectedNodeForConfig(node);
      setNodeConfigOpen(true);
    }
  }, []);

  const handleNodeConfigSave = useCallback(
    (config: { credentialId: string; template: Record<string, any> }) => {
      if (!selectedNodeForConfig) return;

      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNodeForConfig.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  config,
                  configured: true,
                },
              }
            : node,
        ),
      );

      toast({
        title: "Success",
        description: `${selectedNodeForConfig.data.nodeType} node configured successfully`,
      });

      setSelectedNodeForConfig(null);
    },
    [selectedNodeForConfig],
  );

  const addNodeFromSelector = useCallback(
    (nodeType: NodeType) => {
      const newNodeId = `${Date.now()}`;
      let nodeData;
      if (nodeType.type === "manual") {
        nodeData = {
          label: "Manual Trigger",
          nodeType: "manual",
          icon: "▶️",
          description: "Manually trigger the workflow",
        };
      } else if (nodeType.type === "webhook") {
        nodeData = {
          label: "Webhook",
          nodeType: "webhook",
          icon: "🔗",
          description: "Trigger workflow via HTTP webhook",
        };
      } else {
        nodeData = {
          label: nodeType.name,
          nodeType: nodeType.type,
          icon: nodeType.icon,
          description: nodeType.description,
        };
      }

      const newNode: Node = {
        id: newNodeId,
        type: "custom",
        data: nodeData,
        position: {
          x: 300 + nodes.length * 120,
          y: 150 + (nodes.length % 3) * 100,
        },
        className: "!bg-card !border-border !text-foreground shadow-sm",
        style: {
          minWidth: 150,
          borderRadius: "8px",
        },
      };

      setNodes((nds) => [...nds, newNode]);

      console.log(`Added ${nodeType.name} node to workflow`);
    },
    [nodes, setNodes],
  );

  const handleExecuteWorkflow = async () => {
    if (workflowId) {
      const context = {};
      try {
        await executionService.executeWorkflow(workflowId, context);
        toast({ title: "Success", description: "Workflow execution started" });
      } catch (error) {
        toast({ title: "Failed", description: "Workflow execution failed" });
      }
    } else {
      toast({
        title: "Error",
        description: "Save the workflow before executing",
      });
    }
  };

  const handleSaveWorkflow = async () => {
    const backendNodes: Record<string, unknown> = {};
    for (const node of nodes) {
      backendNodes[node.id] = {
        id: node.id,
        type: node.data.nodeType,
        title: node.data.label,
        credentials: node.data.config?.credentialId,
        data: node.data,
        position: node.position,
      };
    }
    const backendConnections: Record<string, string[]> = {};
    for (const edge of edges) {
      const sourceId = edge.source;
      const targetId = edge.target;
      if (sourceId && targetId) {
        if (!backendConnections[sourceId]) {
          backendConnections[sourceId] = [];
        }
        backendConnections[sourceId].push(targetId);
      }
    }
    const workflowData = {
      title: workflowTitle,
      nodes: backendNodes,
      connections: backendConnections,
      trigger_type: "Manual",
    };
    try {
      if (workflowId) {
        await workflowService.updateWorkflow(workflowId, workflowData);
        toast({
          title: "Success",
          description: "Workflow updated successfully",
        });
      } else {
        await workflowService.saveWorkflow(workflowData);
        toast({
          title: "Success",
          description: "Workflow successfully created",
        });
      }
    } catch (error) {
      toast({ title: "failed", description: "Failed to create workflow" });
    }
  };

  useEffect(() => {
    if (workflowId) {
      workflowService.getWorkflowById(workflowId).then((data) => {
        if (data) {
          // Set workflow title
          if (data.title) {
            setWorkflowTitle(data.title);
          }

          // Load nodes if available
          if (data.nodes) {
            const reactFlowNodes = Object.entries(data.nodes)
              .map(
                (
                  [nodeId, nodeData]: [string, Record<string, unknown>],
                  index,
                ) => {
                  if (!nodeData) {
                    return null;
                  }
                  return {
                    id: nodeData.id || nodeId,
                    type: "custom",
                    data: nodeData.data || nodeData,
                    position: nodeData.position || {
                      x: 100 + index * 200,
                      y: 100,
                    },
                    className:
                      "!bg-card !border-border !text-foreground shadow-sm",
                    style: {
                      minWidth: 150,
                      borderRadius: "8px",
                    },
                  };
                },
              )
              .filter(Boolean) as Node[];
            const reactFlowEdges = [];
            for (const sourceId in data.connections) {
              const targets = data.connections[sourceId];
              if (Array.isArray(targets)) {
                for (const targetId of targets) {
                  reactFlowEdges.push({
                    id: `${sourceId}-${targetId}`,
                    source: sourceId,
                    target: targetId,
                  });
                }
              } else {
                console.error(
                  "targets is not an array for sourceId:",
                  sourceId,
                );
              }
            }
            setNodes(reactFlowNodes);
            setEdges(reactFlowEdges);
          }
        }
      });
    }
  }, [workflowId]);

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <header className="h-14 border-b border-border bg-background px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/personal")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {workflowTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleSaveWorkflow}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            onClick={handleExecuteWorkflow}
            className="bg-primary hover:bg-primary/90"
          >
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>
        </div>
      </header>

      <div className="flex-1 bg-background relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          className="bg-background"
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.1}
          maxZoom={2}
          attributionPosition="bottom-left"
          fitView
        ></ReactFlow>
        {/* Node Configuration Dialog */}
        {selectedNodeForConfig && (
          <NodeConfigurationDialog
            open={nodeConfigOpen}
            onOpenChange={setNodeConfigOpen}
            nodeType={selectedNodeForConfig.data.nodeType as string}
            onSave={handleNodeConfigSave}
            initialConfig={selectedNodeForConfig.data.config}
            WorkflowId={workflowId}
          />
        )}

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={() => setNodeSelectorOpen(true)}
            >
              <div className="w-32 h-24 border-2 border-dashed border-muted-foreground/40 group-hover:border-primary/60 rounded-lg flex items-center justify-center transition-colors">
                <Plus className="w-8 h-8 text-muted-foreground/60 group-hover:text-primary/80 transition-colors" />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Add first step...
              </span>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 z-10">
          <NodeSelector
            onAddNode={addNodeFromSelector}
            open={nodeSelectorOpen}
            onOpenChange={setNodeSelectorOpen}
            trigger={
              <Button
                size="sm"
                className="rounded-full w-10 h-10 p-0 shadow-lg bg-primary hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowEditor;
