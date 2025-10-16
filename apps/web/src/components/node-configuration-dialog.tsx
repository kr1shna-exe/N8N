import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Copy } from "lucide-react";
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
  template: Record<string, any>;
}

interface NodeConfigurationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeType: string;
  onSave: (config: NodeConfig) => void;
  initialConfig?: Partial<NodeConfig>;
  WorkflowId: string;
}

export function NodeConfigurationDialog({
  open,
  onOpenChange,
  nodeType,
  onSave,
  initialConfig = {},
  WorkflowId,
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
    reply_to: initialConfig?.template?.reply_to || "",
    waitForReply: initialConfig?.template?.waitForReply || false,
  });

  const webhookUrl = `${import.meta.env.VITE_BACKEND_URL}/api/webhook/${WorkflowId}`;

  // Form specific fields
  interface FormField {
    name: string;
    type: string;
    required: boolean;
    placeholder: string;
  }

  const [formConfig, setFormConfig] = useState({
    title: initialConfig?.template?.title || "Fill out this form",
    description:
      initialConfig?.template?.description ||
      "Please fill out all required fields",
    submitButtonText: initialConfig?.template?.submitButtonText || "Submit",
    fields: (Array.isArray(initialConfig?.template?.fields)
      ? initialConfig.template.fields
      : [
          {
            name: "Name",
            type: "text",
            required: true,
            placeholder: "Enter your name",
          },
        ]) as FormField[],
  });

  const [agentConfig, setAgentConfig] = useState({
    prompt: initialConfig?.template?.prompt || "",
  });

  const loadCredentials = useCallback(async () => {
    if (nodeType === "webhook" || nodeType === "form") {
      setCredentials([]);
      return;
    }
    setLoadingCredentials(true);
    try {
      const data = await credentialsApi.getCredentials();

      // Filter credentials based on node type
      const platformMap: Record<string, string | string[]> = {
        telegram: "Telegram",
        email: "ResendEmail",
        form: "Form",
        agent: ["Gemini", "Groq"],
      };

      const filteredCredentials = (data.credentials || []).filter(
        (cred: Credential) => {
          const expectedPlatform = platformMap[nodeType];
          return Array.isArray(expectedPlatform)
            ? expectedPlatform.includes(cred.platform)
            : expectedPlatform === cred.platform;
        }
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
      setSelectedCredentialId(initialConfig?.credentialId || "");
      setTelegramConfig({
        message: initialConfig?.template?.message || "",
      });
      setEmailConfig({
        to: initialConfig?.template?.to || "",
        subject: initialConfig?.template?.subject || "",
        body: initialConfig?.template?.body || "",
        reply_to: initialConfig?.template?.reply_to || "",
        waitForReply: initialConfig?.template?.waitForReply || false,
      });
      setFormConfig({
        title: initialConfig?.template?.title || "Fill out this form",
        description:
          initialConfig?.template?.description ||
          "Please fill out all required fields",
        submitButtonText: initialConfig?.template?.submitButtonText || "Submit",
        fields: (Array.isArray(initialConfig?.template?.fields)
          ? initialConfig.template.fields
          : [
              {
                name: "Name",
                type: "text",
                required: true,
                placeholder: "Enter your name",
              },
            ]) as FormField[],
      });
      setAgentConfig({
        prompt: initialConfig?.template?.prompt || "",
      });
    }
  }, [open, initialConfig]);

  useEffect(() => {
    if (open) {
      loadCredentials();
    }
  }, [open, loadCredentials]);

  const handleSave = () => {
    // Form nodes don't need credentials
    if (
      nodeType !== "form" &&
      nodeType !== "webhook" &&
      !selectedCredentialId
    ) {
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
        reply_to: emailConfig.reply_to,
        waitForReply: emailConfig.waitForReply,
      };
    } else if (nodeType === "form") {
      if (!formConfig.title.trim() || formConfig.fields.length === 0) {
        toast({
          title: "Error",
          description: "Please provide a form title and at least one field",
          variant: "destructive",
        });
        return;
      }

      // Validate that all fields have required properties
      const invalidFields = formConfig.fields.filter((field) => !field.name);
      if (invalidFields.length > 0) {
        toast({
          title: "Error",
          description: "All form fields must have a name",
          variant: "destructive",
        });
        return;
      }

      template = {
        title: formConfig.title,
        description: formConfig.description,
        submitButtonText: formConfig.submitButtonText,
        fields: formConfig.fields,
      };
    } else if (nodeType === "agent") {
      if (!agentConfig.prompt.trim()) {
        toast({
          title: "Error",
          description: "Please provide a prompt for the AI agent",
          variant: "destructive",
        });
        return;
      }
      template = { prompt: agentConfig.prompt };
    } else if (nodeType === "webhook") {
      template = {};
    }

    const config = {
      credentialId: selectedCredentialId || "none", // Form doesn't need credentials
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
    } else if (nodeType === "agent") {
      return (
        <div className="mt-4 p-3 bg-muted rounded-md">
          <h4 className="text-sm font-medium mb-2">
            Selected Credential Details:
          </h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">
                {selectedCredential.platform === "GEMINI"
                  ? "Gemini API Key"
                  : "API Key"}
                :
              </span>{" "}
              <span className="font-mono text-xs">
                {data.apiKey ? `${data.apiKey.substring(0, 10)}...` : "Not set"}
              </span>
            </div>
          </div>
        </div>
      );
    }
  };

  const addFormField = () => {
    setFormConfig((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          name: "",
          type: "text",
          required: false,
          placeholder: "",
        },
      ],
    }));
  };

  const removeFormField = (index: number) => {
    setFormConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const updateFormField = (index: number, field: FormField) => {
    setFormConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? field : f)),
    }));
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
            <Label htmlFor="reply_to">Reply To Email</Label>
            <Input
              id="reply_to"
              type="email"
              placeholder="your-inbound-address@inbound.postmarkapp.com"
              value={emailConfig.reply_to}
              onChange={(e) =>
                setEmailConfig((prev) => ({
                  ...prev,
                  reply_to: e.target.value,
                }))
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="waitForReply"
              checked={emailConfig.waitForReply}
              onCheckedChange={(checked) =>
                setEmailConfig((prev) => ({
                  ...prev,
                  waitForReply: !!checked,
                }))
              }
            />
            <Label
              htmlFor="waitForReply"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Wait for reply before continuing
            </Label>
          </div>
        </div>
      );
    } else if (nodeType === "agent") {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="prompt">AI Agent Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Enter your AI agent prompt here... You can use {{variableName}} for dynamic content. The agent can search the web and summarize content based on your prompt."
              value={agentConfig.prompt}
              onChange={(e) => setAgentConfig({ prompt: e.target.value })}
              rows={6}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use Mustache syntax like {"{"}name{"}"} for dynamic values. The AI
              agent can search the web and summarize content.
            </p>
          </div>
        </div>
      );
    } else if (nodeType === "form") {
      return (
        <div className="space-y-6">
          {/* Form Basic Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                placeholder="Enter form title"
                value={formConfig.title}
                onChange={(e) =>
                  setFormConfig((prev) => ({ ...prev, title: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="form-description">
                Form Description (optional)
              </Label>
              <Textarea
                id="form-description"
                placeholder="Enter form description"
                value={formConfig.description}
                onChange={(e) =>
                  setFormConfig((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="submit-button">Submit Button Text</Label>
              <Input
                id="submit-button"
                placeholder="Submit"
                value={formConfig.submitButtonText}
                onChange={(e) =>
                  setFormConfig((prev) => ({
                    ...prev,
                    submitButtonText: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Form Attributes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFormField}
                className="text-xs"
              >
                + Add Field
              </Button>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto">
              {formConfig.fields.map((field, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Field {index + 1}
                    </span>
                    {formConfig.fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFormField(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor={`field-name-${index}`}>Field Name</Label>
                      <Input
                        id={`field-name-${index}`}
                        placeholder="Field Name(Email, Username, Number..)"
                        value={field.name}
                        onChange={(e) =>
                          updateFormField(index, {
                            ...field,
                            name: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`field-type-${index}`}>Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) =>
                          updateFormField(index, { ...field, type: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`field-placeholder-${index}`}>
                        Placeholder
                      </Label>
                      <Input
                        id={`field-placeholder-${index}`}
                        placeholder="Enter placeholder text"
                        value={field.placeholder}
                        onChange={(e) =>
                          updateFormField(index, {
                            ...field,
                            placeholder: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`field-required-${index}`}
                      checked={field.required}
                      onChange={(e) =>
                        updateFormField(index, {
                          ...field,
                          required: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <Label
                      htmlFor={`field-required-${index}`}
                      className="text-sm"
                    >
                      Required field
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (nodeType === "webhook") {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input id="webhook-url" value={webhookUrl} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  toast({
                    title: "Copied to clipboard",
                    description: "Webhook URL copied to clipboard",
                  });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Send a POST request to this URL to trigger your workflow. The
              request body will be available as the output of this node.
            </p>
          </div>
        </div>
      );
    }
  };

  const getDialogTitle = () => {
    if (nodeType === "telegram") return "Configure Telegram Node";
    if (nodeType === "email") return "Configure Email Node";
    if (nodeType === "form") return "Configure Form Node";
    if (nodeType === "webhook") return "Webhook Trigger";
    if (nodeType === "agent") return "Configure AI Agent";
    return "Configure Node";
  };

  const getNodeIcon = () => {
    if (nodeType === "telegram") return "📱";
    if (nodeType === "email") return "📧";
    if (nodeType === "form") return "📝";
    if (nodeType === "webhook") return "🔗";
    if (nodeType === "agent") return "🤖";
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
          {/* Credentials Section - Skip for form nodes */}
          {nodeType !== "form" && nodeType !== "webhook" && (
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
          )}

          {/* Template Fields Section */}
          <div>
            {nodeType !== "webhook" && (
              <h3 className="text-lg font-medium mb-4">
                {nodeType === "telegram"
                  ? "Message Configuration"
                  : nodeType === "email"
                    ? "Email Configuration"
                    : nodeType === "agent"
                      ? "AI Agent Configuration"
                      : "Form Configuration"}
              </h3>
            )}
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
