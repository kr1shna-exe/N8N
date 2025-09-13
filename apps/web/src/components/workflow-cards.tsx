import { Card, CardContent } from "@/components/ui/card";
import { FileText, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WorkflowCards() {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
      <Card 
        className="bg-card hover:bg-accent/50 transition-colors cursor-pointer border border-border"
        onClick={() => navigate('/workflow-editor')}
      >
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Start from scratch
          </h3>
          <p className="text-sm text-muted-foreground">
            Create a new workflow from the beginning
          </p>
        </CardContent>
      </Card>

      <Card 
        className="bg-card hover:bg-accent/50 transition-colors cursor-pointer border border-border"
        onClick={() => navigate('/workflow-editor')}
      >
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
            <Bot className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Test a simple AI Agent example
          </h3>
          <p className="text-sm text-muted-foreground">
            Get started with a pre-built AI agent workflow
          </p>
        </CardContent>
      </Card>
    </div>
  );
}