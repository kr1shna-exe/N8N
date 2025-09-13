import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkflowTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function WorkflowTabs({ activeTab, onTabChange }: WorkflowTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-8">
      <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-10">
        <TabsTrigger 
          value="workflows" 
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          Workflows
        </TabsTrigger>
        <TabsTrigger 
          value="credentials" 
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          Credentials
        </TabsTrigger>
        <TabsTrigger 
          value="executions" 
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          Executions
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}