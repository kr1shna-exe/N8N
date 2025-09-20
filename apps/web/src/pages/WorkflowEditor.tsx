import { NodePalette } from "@/components/node-palette";
import { Button } from "@/components/ui/button";
import type { NodeType } from "@/lib/nodes";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Save,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Start" },
    position: { x: 250, y: 25 },
    className: "!bg-muted !border-border !text-foreground",
  },
];

const initialEdges: Edge[] = [];

const WorkflowEditor = () => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showNodePalette, setShowNodePalette] = useState(true);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const addNodeFromPalette = useCallback(
    (nodeType: NodeType) => {
      const newNodeId = `${Date.now()}`; // Use timestamp for unique IDs
      const newNode: Node = {
        id: newNodeId,
        type: "default",
        data: {
          label: `${nodeType.icon} ${nodeType.name}`,
          nodeType: nodeType.type,
          icon: nodeType.icon,
          description: nodeType.description,
        },
        position: {
          x: 300 + nodes.length * 100,
          y: 150 + (nodes.length % 3) * 100,
        },
        className: "!bg-card !border-border !text-foreground shadow-sm",
        style: {
          minWidth: 150,
          borderRadius: "8px",
        },
      };

      // Add the new node
      setNodes((nds) => [...nds, newNode]);

      console.log(`Added ${nodeType.name} node to workflow`);
    },
    [nodes, setNodes]
  );

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Header */}
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
            Workflow Editor
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNodePalette(!showNodePalette)}
          >
            {showNodePalette ? (
              <PanelRightClose className="w-4 h-4 mr-2" />
            ) : (
              <PanelRightOpen className="w-4 h-4 mr-2" />
            )}
            {showNodePalette ? "Hide" : "Show"} Nodes
          </Button>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex bg-background">
        {/* Node Palette */}
        {showNodePalette && (
          <NodePalette
            onAddNode={addNodeFromPalette}
            className="flex-shrink-0"
          />
        )}

        {/* Workflow Canvas */}
        <div className="flex-1 bg-background">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            className="bg-background"
            proOptions={{ hideAttribution: true }}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            attributionPosition="bottom-left"
            fitView
          >
            {/* We can add controls, background, etc. here */}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default WorkflowEditor;
