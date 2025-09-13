import { AddCredentialDialog } from "@/components/add-credential-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowCards } from "@/components/workflow-cards";
import { WorkflowTabs } from "@/components/workflow-tabs";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const Personal = () => {
  const [activeTab, setActiveTab] = useState("workflows");
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [showAddButton, setShowAddButton] = useState(false);

  const handleSaveCredential = (credential: any) => {
    setCredentials([...credentials, credential]);
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials(credentials.filter((cred) => cred.id !== id));
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
          {credentials.length === 0 ? (
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
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Created{" "}
                        {new Date(credential.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "executions" && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            No executions yet
          </h3>
          <p className="text-muted-foreground">
            Your workflow executions will appear here
          </p>
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
