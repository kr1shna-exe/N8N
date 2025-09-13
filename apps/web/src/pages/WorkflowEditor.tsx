import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Play, Save, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 25 },
    className: '!bg-muted !border-border !text-foreground',
  },
];

const initialEdges: Edge[] = [];

const WorkflowEditor = () => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNodeId = `${nodes.length + 1}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'default',
      data: { label: `Node ${nodes.length + 1}` },
      position: { x: 250 + (nodes.length * 150), y: 100 },
      className: '!bg-muted !border-border !text-foreground',
    };
    
    // Add the new node
    setNodes((nds) => [...nds, newNode]);
    
    // If there are existing nodes, connect the last node to the new node
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newEdge: Edge = {
        id: `e${lastNode.id}-${newNodeId}`,
        source: lastNode.id,
        target: newNodeId,
        type: 'default',
        className: '!stroke-border',
      };
      setEdges((eds) => [...eds, newEdge]);
    }
  }, [nodes, setNodes, setEdges]);

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-background px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/personal')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Workflow Editor</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={addNode}>
            <Plus className="w-4 h-4 mr-2" />
            Add Node
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
        >
          {/* We can add controls, background, etc. here */}
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowEditor;