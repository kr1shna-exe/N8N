import { AddCredentialDialog } from "@/components/add-credential-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowCards } from "@/components/workflow-cards";
import { WorkflowTabs } from "@/components/workflow-tabs";
import { toast } from "@/hooks/use-toast";
import {
  credentialsApi,
  mapFromBackendCredential,
  mapToBackendCredential,
} from "@/lib/credentials";
import { executionService } from "@/lib/executions";
import { CheckCircle, Clock, Loader, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const Personal = () => {
  const [activeTab, setActiveTab] = useState("workflows");
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [showAddButton, setShowAddButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executions, setExecutions] = useState<any[]>([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);

  // Load credentials when switching to credentials tab
  useEffect(() => {
    if (activeTab === "credentials") {
      loadCredentials();
    } else if (activeTab === "executions") {
      loadExecutions();
    }
  }, [activeTab]);

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
        mapFromBackendCredential
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
        response.newCredentials
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

  const getStatusIcon = (
    status: boolean,
    tasks_done: number,
    total_tasks: number
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
    total_tasks: number
  ) => {
    if (status) return "Completed";
    if (tasks_done > 0) return "Running";
    return "Pending";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Personal</h1>
        <p className="text-muted-foreground">
          Workflows and credentials owned by you
        </p>
      </div>

      {/* Tabs */}
      <WorkflowTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content based on active tab */}
      {activeTab === "workflows" && (
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-xl font-medium text-foreground">
              👋 Welcome Krishna!
            </h2>
            <p className="text-muted-foreground">Create your first workflow</p>
          </div>

          {/* Action Cards */}
          <div className="flex justify-center">
            <WorkflowCards />
          </div>
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
                          execution.total_tasks
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
                            execution.total_tasks
                          )}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {execution.tasks_done}/{execution.total_tasks} tasks
                        </div>
                      </div>
                    </CardHeader>
                    <div className="px-6 pb-4">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        {/* <span>Started: {formatDate(execution.created_at)}</span>
                        {execution.status && (
                          <span>
                            Completed: {formatDate(execution.updated_at)}
                          </span>
                        )} */}
                      </div>
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
