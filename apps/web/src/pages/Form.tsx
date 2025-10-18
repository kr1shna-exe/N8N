import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { executionService } from "@/lib/executions";
import { workflowService } from "@/lib/workflows";
import { AlertCircle, CheckCircle, Clock, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
}

interface FormTemplate {
  title: string;
  description: string;
  submitButtonText: string;
  fields: FormField[];
}

const FormPage = () => {
  const { execution_id } = useParams();
  const [execution, setExecution] = useState<any>(null);
  const [workflow, setWorkflow] = useState<any>(null);
  const [formNode, setFormNode] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (execution_id) {
      console.log("Loading execution:", execution_id);
      executionService
        .getExecutionById(execution_id)
        .then((data) => {
          console.log("Execution data received:", data);
          setExecution(data);
        })
        .catch((err) => {
          console.error("Failed to load execution:", err);
          setError(err);
        });
    }
  }, [execution_id]);

  useEffect(() => {
    if (execution) {
      console.log("Loading workflow for execution:", execution);
      workflowService
        .getWorkflowById(execution.workflow_id)
        .then((data) => {
          console.log("Workflow data received:", data);
          setWorkflow(data);
        })
        .catch((err) => {
          console.error("Failed to load workflow:", err);
          setError(err);
        });
    }
  }, [execution]);

  useEffect(() => {
    if (workflow && execution) {
      console.log("Processing form node detection:", {
        executionStatus: execution.status,
        pausedNodeId: execution.paused_node_id,
        availableNodes: Object.keys(workflow.nodes || {}),
        workflowNodes: workflow.nodes,
      });

      const pausedNode = workflow.nodes[execution.paused_node_id];
      console.log("Paused node details:", {
        nodeExists: !!pausedNode,
        nodeType: pausedNode?.type,
        nodeDataType: pausedNode?.data?.nodeType,
        nodeData: pausedNode?.data,
        isFormNode:
          pausedNode &&
          (pausedNode.type === "form" || pausedNode.data?.nodeType === "form"),
      });

      if (
        pausedNode &&
        (pausedNode.type === "form" || pausedNode.data?.nodeType === "form")
      ) {
        setFormNode(pausedNode);
        // Initialize form data with empty values
        const initialData: Record<string, any> = {};
        const template =
          pausedNode.data?.config?.template || pausedNode.template;
        console.log("Form template:", template);
        template?.fields?.forEach((field: FormField) => {
          initialData[field.name] = "";
        });
        setFormData(initialData);
      } else {
        console.log("Form node not found or not a form type");
      }
      setLoading(false);
    }
  }, [workflow, execution]);

  const handleInputChange = (fieldKey: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
    // Clear validation error for this field
    if (validationErrors[fieldKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const template = (formNode?.data?.config?.template ||
      formNode?.template) as FormTemplate;

    template?.fields?.forEach((field: FormField) => {
      if (
        field.required &&
        (!formData[field.name] || String(formData[field.name]).trim() === "")
      ) {
        errors[field.name] = `${field.name} is required`;
      }

      // Email validation
      if (
        field.type === "email" &&
        formData[field.name] &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])
      ) {
        errors[field.name] = "Please enter a valid email address";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await executionService.resumeWorkflow(execution_id!, formData);
      // Show success state
      setFormNode({ ...formNode, submitted: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldValue = formData[field.name] || "";
    const hasError = !!validationErrors[field.name];

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label || field.name || "Unnamed Field"}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={
                hasError ? "border-destructive focus:border-destructive" : ""
              }
              rows={3}
            />
            {hasError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors[field.name]}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label || field.name || "Unnamed Field"}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select
              value={fieldValue}
              onValueChange={(value) => handleInputChange(field.name, value)}
            >
              <SelectTrigger
                className={
                  hasError ? "border-destructive focus:border-destructive" : ""
                }
              >
                <SelectValue
                  placeholder={field.placeholder || `Select ${field.label}`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors[field.name]}
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                id={field.name}
                type="checkbox"
                checked={fieldValue === true}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                className="rounded border-input"
              />
              <Label
                htmlFor={field.name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {field.label || field.name || "Unnamed Field"}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
            </div>
            {hasError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors[field.name]}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label || field.name || "Unnamed Field"}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={
                hasError ? "border-destructive focus:border-destructive" : ""
              }
            />
            {hasError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors[field.name]}
              </p>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-sm border">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !formNode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-sm border">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="w-8 h-8 text-destructive mb-4" />
            <p className="text-destructive text-center">
              {error || "An error occurred"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formNode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-sm border">
          <CardContent className="pt-8 pb-6">
            <div className="text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-medium text-foreground mb-2">
                Form not found
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Form not found or workflow is not paused at a form.
              </p>
              <div className="text-xs text-muted-foreground text-left p-3 bg-muted rounded">
                <p>
                  <strong>Debug Info:</strong>
                </p>
                <p>Execution ID: {execution_id}</p>
                <p>Execution Status: {execution?.status || "Not loaded"}</p>
                <p>Paused Node ID: {execution?.paused_node_id || "None"}</p>
                <p>Has Workflow: {workflow ? "Yes" : "No"}</p>
                <p>
                  Available Nodes:{" "}
                  {workflow
                    ? Object.keys(workflow.nodes || {}).join(", ")
                    : "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const template = (formNode?.data?.config?.template ||
    formNode?.template) as FormTemplate;

  // Show success state
  if (formNode.submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-sm border">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-center mb-2 text-foreground">
              Form Submitted Successfully!
            </h2>
            <p className="text-muted-foreground text-center">
              Thank you for your submission. The workflow will continue
              processing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-md mx-auto px-4">
        {/* Form Header */}
        <div className="text-center mb-6">
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-700 text-xs"
          >
            This is a test version of your form
          </Badge>
        </div>

        <Card className="shadow-sm border">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-medium">
              {template?.title || "Form"}
            </CardTitle>
            {template?.description && (
              <CardDescription className="text-sm mt-2 text-muted-foreground">
                {template.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dynamic Form Fields */}
              {template?.fields?.length > 0 ? (
                template.fields.map((field) => renderField(field))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    No form fields configured
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Template: {JSON.stringify(template)}
                  </p>
                </div>
              )}

              {/* Global Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    template?.submitButtonText || "Submit"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            Form automated with
            <span className="font-semibold text-primary">n8n</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
