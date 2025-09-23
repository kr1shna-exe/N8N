import { AddCredentialDialog } from "@/components/add-credential-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { WorkflowCards } from "@/components/workflow-cards";
import { WorkflowTabs } from "@/components/workflow-tabs";
import { toast } from "@/hooks/use-toast";
import {
  credentialsApi,
  mapFromBackendCredential,
  mapToBackendCredential,
} from "@/lib/credentials";
import { executionService } from "@/lib/executions";
import { workflowService } from "@/lib/workflows";
import {
  CheckCircle,
  Clock,
  Edit,
  Filter,
  Loader,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Personal = () => {
  const [activeTab, setActiveTab] = useState("workflows");
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [showAddButton, setShowAddButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executions, setExecutions] = useState<any[]>([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (activeTab === "credentials") {
      loadCredentials();
    } else if (activeTab === "executions") {
      loadExecutions();
    } else if (activeTab === "workflows") {
      loadWorkflows();
    }
  }, [activeTab]);

  const loadWorkflows = async () => {
    try {
      setWorkflowsLoading(true);
      const response = await workflowService.getWorkflows();
      setWorkflows(response);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load workflows" });
    } finally {
      setWorkflowsLoading(false);
    }
  };

  const loadExecutions = async () => {
    try {
      setExecutionsLoading(true);
      const response = await executionService.getExecutions();
      setExecutions(response.executions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load executions",
        variant: "destructive",
      });
    } finally {
      setExecutionsLoading(false);
    }
  };

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const response = await credentialsApi.getCredentials();
      const frontendCredentials = response.credentials.map(
        mapFromBackendCredential,
      );
      setCredentials(frontendCredentials);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredential = async (credentialData: any) => {
    try {
      const backendCredential = mapToBackendCredential(credentialData);
      const response =
        await credentialsApi.createCredentials(backendCredential);
      const frontendCredential = mapFromBackendCredential(
        response.newCredentials,
      );
      setCredentials([...credentials, frontendCredential]);

      toast({
        title: "Success",
        description: "Credential created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create credential",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCredential = async (id: string) => {
    try {
      await credentialsApi.deleteCredentials(id);
      setCredentials(credentials.filter((cred) => cred.id !== id));

      toast({
        title: "Success",
        description: "Credential deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete credential",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await workflowService.deleteWorkflow(workflowId);
      setWorkflows(workflows.filter((workflow) => workflow.id !== workflowId));
      toast({
        title: "Success",
        description: "Successfully deleted workflows",
      });
    } catch (error) {
      toast({ title: "Failed", description: "Failed to delete the workflow" });
    }
  };

  const getStatusIcon = (
    status: boolean,
    tasks_done: number,
    total_tasks: number,
  ) => {
    if (status) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (tasks_done > 0) {
      return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (
    status: boolean,
    tasks_done: number,
    total_tasks: number,
  ) => {
    if (status) return "Completed";
    if (tasks_done > 0) return "Running";
    return "Pending";
  };

  const handleDeleteExecution = async (executionId: string) => {
    try {
      // Note: Add proper delete endpoint when backend supports it
      toast({
        title: "Not Implemented",
        description: "Delete execution functionality will be added soon",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete execution",
        variant: "destructive",
      });
    }
  };

  const handleEditExecution = (executionId: string) => {
    // Navigate to execution details or edit view
    toast({
      title: "Not Implemented",
      description: "Edit execution functionality will be added soon",
    });
  };

  const handleEditWorkflow = (workflowId: string) => {
    navigate(`/workflow-editor/${workflowId}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Personal</h1>
        <p className="text-muted-foreground">
          Workflows and credentials owned by you
        </p>
      </div>

      <WorkflowTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "workflows" && (
        <div className="space-y-6">
          {/* Search and Filter Section */}
          {/* <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  Sort by last updated
                </Button>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Total {workflows.length}</span>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800 hover:bg-orange-100"
              >
                {workflows.length}
              </Badge>
            </div>
          </div> */}

          {/* Workflows List */}
          {workflowsLoading ? (
            <div className="text-center py-12">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading workflows...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">
                No workflows yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first workflow to get started
              </p>
              <WorkflowCards />
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No workflows found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-foreground truncate">
                      {workflow.title || "Untitled Workflow"}
                    </h3>
                    {/* <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>
                        Last updated{" "}
                        {workflow.updated_at
                          ? formatDate(workflow.updated_at)
                          : "recently"}
                      </span>
                      <span>•</span>
                      <span>
                        Created{" "}
                        {workflow.created_at
                          ? formatDate(workflow.created_at)
                          : "recently"}
                      </span>
                    </div> */}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      Active
                    </Badge> */}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditWorkflow(workflow.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {/* <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>50/page</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div> */}
            </div>
          )}
        </div>
      )}

      {activeTab === "credentials" && (
        <div
          className="relative min-h-[300px] p-6 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-all duration-300 group"
          onMouseEnter={() => setShowAddButton(true)}
          onMouseLeave={() => setShowAddButton(false)}
        >
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading credentials...</p>
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">
                No credentials yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first credential to get started
              </p>
              <div
                className={`transition-all duration-300 transform ${showAddButton ? "opacity-100 scale-100 translate-y-0" : "opacity-100 scale-95 translate-y-2"}`}
              >
                <Button
                  onClick={() => setShowAddCredential(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credential
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Your Credentials
                </h3>
                <div
                  className={`transition-all duration-300 transform ${showAddButton ? "opacity-100 scale-100 translate-y-0" : "opacity-100 scale-95 translate-y-2 pb-4"}`}
                >
                  <Button
                    onClick={() => setShowAddCredential(true)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credential
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {credentials.map((credential) => (
                  <Card
                    key={credential.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {credential.service.icon}
                        </span>
                        <div>
                          <CardTitle className="text-base">
                            {credential.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {credential.service.api}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Connected</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCredential(credential.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "executions" && (
        <div className="space-y-4">
          {executionsLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading executions...</p>
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">
                No executions yet
              </h3>
              <p className="text-muted-foreground">
                Your workflow executions will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Recent Executions ({executions.length})
                </h3>
                <Button onClick={loadExecutions} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>

              <div className="grid gap-4">
                {executions.map((execution) => (
                  <Card
                    key={execution.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(
                          execution.status,
                          execution.tasks_done,
                          execution.total_tasks,
                        )}
                        <div>
                          <CardTitle className="text-base">
                            Execution {execution.id.slice(-8)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Workflow: {execution.workflow_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={
                              execution.status
                                ? "default"
                                : execution.tasks_done > 0
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {getStatusText(
                              execution.status,
                              execution.tasks_done,
                              execution.total_tasks,
                            )}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {execution.tasks_done}/{execution.total_tasks} tasks
                          </div>
                        </div>

                        {/* 3-dots menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditExecution(execution.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteExecution(execution.id)
                              }
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <div className="px-6 pb-4">
                      <div className="flex justify-between text-sm text-muted-foreground"></div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            execution.status ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{
                            width: `${(execution.tasks_done / execution.total_tasks) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddCredentialDialog
        open={showAddCredential}
        onOpenChange={setShowAddCredential}
        onSave={handleSaveCredential}
      />
    </div>
  );
};

export default Personal;
