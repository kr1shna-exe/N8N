import { AppSidebar } from "@/components/app-sidebar";
import { CreateWorkflowDialog } from "@/components/create-workflow-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { workflowService } from "@/lib/workflows";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const { user, signout } = useAuth();
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);

  const handleSignOut = async () => {
    try {
      await signout();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate("/signin");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleCreateWorkflow = async (workflowName: string) => {
    try {
      const workflowData = {
        title: workflowName,
        nodes: {},
        connections: {},
        trigger_type: "Manual",
      };

      const newWorkflow = await workflowService.saveWorkflow(workflowData);
      toast({
        title: "Success",
        description: `Workflow "${workflowName}" created successfully`,
      });

      // Navigate to the new workflow editor
      navigate(`/workflow-editor/${newWorkflow.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      });
      throw error; // Re-throw to let the dialog handle it
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                onClick={() => setShowCreateWorkflow(true)}
              >
                Create Workflow
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>

      {/* Create Workflow Dialog */}
      <CreateWorkflowDialog
        open={showCreateWorkflow}
        onOpenChange={setShowCreateWorkflow}
        onCreate={handleCreateWorkflow}
      />
    </SidebarProvider>
  );
}
