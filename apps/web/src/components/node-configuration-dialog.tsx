import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { credentialsApi } from "@/lib/credentials";
import { useCallback, useEffect, useState } from "react";

interface Credential {
  id: string;
  title: string;
  platform: string;
  data: {
    apiKey: string;
    chatId?: string;
  };
}

interface NodeConfig {
  credentialId: string;
  template: Record<string, string>;
}

interface NodeConfigurationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeType: string;
  onSave: (config: NodeConfig) => void;
  initialConfig?: Partial<NodeConfig>;
}

export function NodeConfigurationDialog({
  open,
  onOpenChange,
  nodeType,
  onSave,
  initialConfig = {},
}: NodeConfigurationProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState(
    initialConfig?.credentialId || ""
  );
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  // Telegram specific fields
  const [telegramConfig, setTelegramConfig] = useState({
    message: initialConfig?.template?.message || "",
  });

  // Email specific fields
  const [emailConfig, setEmailConfig] = useState({
    to: initialConfig?.template?.to || "",
    subject: initialConfig?.template?.subject || "",
    body: initialConfig?.template?.body || "",
  });

  const loadCredentials = useCallback(async () => {
    setLoadingCredentials(true);
    try {
      const data = await credentialsApi.getCredentials();

      // Filter credentials based on node type
      const platformMap: Record<string, string> = {
        telegram: "Telegram",
        email: "ResendEmail",
      };

      const filteredCredentials = (data.credentials || []).filter(
        (cred: Credential) => cred.platform === platformMap[nodeType]
      );

      setCredentials(filteredCredentials);
      console.log("Loaded credentials for", nodeType, ":", filteredCredentials);
    } catch (error) {
      console.error("Failed to load credentials:", error);
      toast({
        title: "Error",
        description:
          "Failed to load credentials. Please check if you're logged in.",
        variant: "destructive",
      });
    } finally {
      setLoadingCredentials(false);
    }
  }, [nodeType]);

  useEffect(() => {
    if (open) {
      loadCredentials();
    }
  }, [open, loadCredentials]);

  const handleSave = () => {
    if (!selectedCredentialId) {
      toast({
        title: "Error",
        description: "Please select a credential",
        variant: "destructive",
      });
      return;
    }

    let template = {};

    if (nodeType === "telegram") {
      if (!telegramConfig.message.trim()) {
        toast({
          title: "Error",
          description: "Please enter a message template",
          variant: "destructive",
        });
        return;
      }
      template = { message: telegramConfig.message };
    } else if (nodeType === "email") {
      if (
        !emailConfig.to.trim() ||
        !emailConfig.subject.trim() ||
        !emailConfig.body.trim()
      ) {
        toast({
          title: "Error",
          description: "Please fill in all email fields",
          variant: "destructive",
        });
        return;
      }
      template = {
        to: emailConfig.to,
        subject: emailConfig.subject,
        body: emailConfig.body,
      };
    }

    const config = {
      credentialId: selectedCredentialId,
      template,
    };

    onSave(config);
    onOpenChange(false);
  };

  const getSelectedCredential = () => {
    return credentials.find((cred) => cred.id === selectedCredentialId);
  };

  const renderCredentialDetails = () => {
    const selectedCredential = getSelectedCredential();
    if (!selectedCredential) return null;

    const { data } = selectedCredential;

    if (nodeType === "telegram") {
      return (
        <div className="mt-4 p-3 bg-muted rounded-md">
          <h4 className="text-sm font-medium mb-2">
            Selected Credential Details:
          </h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Bot Token:</span>{" "}
              <span className="font-mono text-xs">
                {data.apiKey ? `${data.apiKey.substring(0, 10)}...` : "Not set"}
              </span>
            </div>
            {data.chatId && (
              <div>
                <span className="font-medium">Chat ID:</span>{" "}
                <span className="font-mono text-xs">{data.chatId}</span>
              </div>
            )}
          </div>
        </div>
      );
    } else if (nodeType === "email") {
      return (
        <div className="mt-4 p-3 bg-muted rounded-md">
          <h4 className="text-sm font-medium mb-2">
            Selected Credential Details:
          </h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">API Key:</span>{" "}
              <span className="font-mono text-xs">
                {data.apiKey ? `${data.apiKey.substring(0, 10)}...` : "Not set"}
              </span>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderTemplateFields = () => {
    if (nodeType === "telegram") {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Message Template</Label>
            <Textarea
              id="message"
              placeholder="Enter your message template here... You can use {{variableName}} for dynamic content"
              value={telegramConfig.message}
              onChange={(e) => setTelegramConfig({ message: e.target.value })}
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use Mustache syntax like {"{"}name{"}"} for dynamic values
            </p>
          </div>
        </div>
      );
    } else if (nodeType === "email") {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="to">To Email</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com or {{email}}"
              value={emailConfig.to}
              onChange={(e) =>
                setEmailConfig((prev) => ({ ...prev, to: e.target.value }))
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject or {{subject}}"
              value={emailConfig.subject}
              onChange={(e) =>
                setEmailConfig((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              placeholder="Enter your email content here... You can use {{variableName}} for dynamic content"
              value={emailConfig.body}
              onChange={(e) =>
                setEmailConfig((prev) => ({ ...prev, body: e.target.value }))
              }
              rows={6}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use Mustache syntax like {"{"}name{"}"} for dynamic values. HTML
              is supported.
            </p>
          </div>
        </div>
      );
    }
  };

  const getDialogTitle = () => {
    if (nodeType === "telegram") return "Configure Telegram Node";
    if (nodeType === "email") return "Configure Email Node";
    return "Configure Node";
  };

  const getNodeIcon = () => {
    if (nodeType === "telegram") return "📱";
    if (nodeType === "email") return "📧";
    return "⚙️";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">{getNodeIcon()}</span>
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Credentials Section */}
          <div>
            <Label htmlFor="credential">Select Credential</Label>
            <Select
              value={selectedCredentialId}
              onValueChange={setSelectedCredentialId}
            >
              <SelectTrigger className="mt-1">
                <SelectValue
                  placeholder={
                    loadingCredentials
                      ? "Loading credentials..."
                      : credentials.length === 0
                        ? "No credentials available"
                        : "Select a credential"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {credentials.map((credential) => (
                  <SelectItem key={credential.id} value={credential.id}>
                    <div className="flex items-center gap-2">
                      <span>{getNodeIcon()}</span>
                      <span>{credential.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {credentials.length === 0 && !loadingCredentials && (
              <p className="text-sm text-muted-foreground mt-2">
                No {nodeType} credentials found. Please add credentials first.
              </p>
            )}

            {renderCredentialDetails()}
          </div>

          {/* Template Fields Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">
              {nodeType === "telegram"
                ? "Message Configuration"
                : "Email Configuration"}
            </h3>
            {renderTemplateFields()}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Configuration</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
