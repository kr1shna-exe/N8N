import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, X, Sparkles, ExternalLink, Info } from "lucide-react";

interface AddCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (credential: any) => void;
}

const services = [
  { id: "telegram", name: "Telegram", api: "Telegram API", icon: "📱" },
  { id: "slack", name: "Slack", api: "Slack API", icon: "💬" },
  { id: "github", name: "GitHub", api: "GitHub API", icon: "🐙" },
  { id: "google", name: "Google", api: "Google API", icon: "🔍" },
  { id: "discord", name: "Discord", api: "Discord API", icon: "🎮" },
];

export function AddCredentialDialog({ open, onOpenChange, onSave }: AddCredentialDialogProps) {
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [credentialData, setCredentialData] = useState({
    accessToken: "",
    baseUrl: "",
    name: "",
  });

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServiceSelect = (service: typeof services[0]) => {
    setSelectedService(service);
    setCredentialData({
      ...credentialData,
      name: service.name,
      baseUrl: service.id === "telegram" ? "https://api.telegram.org" : `https://api.${service.id}.com`,
    });
    setStep("configure");
  };

  const handleSave = () => {
    if (selectedService) {
      onSave({
        id: Date.now().toString(),
        service: selectedService,
        ...credentialData,
        createdAt: new Date().toISOString(),
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedService(null);
    setSearchQuery("");
    setCredentialData({ accessToken: "", baseUrl: "", name: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {step === "select" && (
          <>
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-xl">Add new credential</DialogTitle>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Select an app or service to connect to
              </p>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for app..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {filteredServices.map((service) => (
                  <Button
                    key={service.id}
                    variant="ghost"
                    className="flex items-center justify-start gap-3 h-auto p-3"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <span className="text-lg">{service.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">{service.api}</div>
                    </div>
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setStep("configure")} disabled={!selectedService}>
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "configure" && selectedService && (
          <>
            <DialogHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedService.icon}</span>
                <div>
                  <DialogTitle className="text-xl">{selectedService.name} account</DialogTitle>
                  <p className="text-sm text-muted-foreground">{selectedService.api}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} size="sm">
                  Save
                </Button>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <Tabs defaultValue="connection" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="connection">Connection</TabsTrigger>
                <TabsTrigger value="sharing">Sharing</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="connection" className="space-y-6 mt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Need help filling out these fields?</span>
                    <Button variant="link" size="sm" className="p-0 h-auto text-yellow-700 dark:text-yellow-400">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open docs
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Button variant="outline" size="sm" className="text-purple-600 border-purple-600">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Ask Assistant
                  </Button>
                  <span className="text-sm text-muted-foreground">for setup instructions</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Textarea
                      id="accessToken"
                      value={credentialData.accessToken}
                      onChange={(e) => setCredentialData({...credentialData, accessToken: e.target.value})}
                      className="mt-1 min-h-[100px]"
                      placeholder="Enter your access token..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="baseUrl">Base URL</Label>
                    <Input
                      id="baseUrl"
                      value={credentialData.baseUrl}
                      onChange={(e) => setCredentialData({...credentialData, baseUrl: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <span>Enterprise plan users can pull in credentials from external vaults.</span>
                    <Button variant="link" size="sm" className="p-0 h-auto ml-1 text-primary">
                      More info
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sharing" className="space-y-4 mt-6">
                <p className="text-muted-foreground">Configure sharing settings for this credential.</p>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="credentialName">Credential Name</Label>
                  <Input
                    id="credentialName"
                    value={credentialData.name}
                    onChange={(e) => setCredentialData({...credentialData, name: e.target.value})}
                    className="mt-1"
                    placeholder="Enter a name for this credential"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}