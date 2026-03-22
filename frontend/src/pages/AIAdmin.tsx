import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ToneProfilesPanel,
  ModeConfigPanel,
  SafetySettingsPanel,
  SourceRulesPanel,
  ModelSettingsPanel,
  AIPreviewPanel,
  LocationOverridesPanel,
  AILogsPanel,
  HelpDocsPanel,
} from "@/components/admin/ai";
import {
  ArrowLeft,
  Bot,
  MessageSquare,
  Shield,
  Database,
  Settings2,
  PlayCircle,
  Sliders,
  MapPin,
  FileText,
  HelpCircle,
} from "lucide-react";

export default function AIAdmin() {
  const { user, roles, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    // roles come from useAuth() which reads from Payload user.roles
    setIsAdmin(roles.includes("admin"));
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="AI Settings" showSearch={false} />
        <main className="pt-14 pb-8 px-4 max-w-6xl mx-auto">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="AI Settings" showSearch={false} />
        <main className="pt-14 pb-8 px-4 page-content-narrow text-center">
          <Card>
            <CardContent className="pt-6">
              <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You need admin privileges to access AI settings.
              </p>
              <Button onClick={() => navigate("/")}>Go Home</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const sections = [
    {
      id: "tones",
      title: "Tone Profiles",
      description: "Define AI communication styles",
      icon: MessageSquare,
      color: "bg-muted-indigo",
    },
    {
      id: "safety",
      title: "Safety & Sensitivity",
      description: "Trauma-aware and content filtering",
      icon: Shield,
      color: "bg-forest-teal",
    },
    {
      id: "modes",
      title: "Mode Behavior",
      description: "Configure Choose Your Path modes",
      icon: Sliders,
      color: "bg-terracotta",
    },
    {
      id: "sources",
      title: "Source Controls",
      description: "What content AI can reference",
      icon: Database,
      color: "bg-adventure-green",
    },
    {
      id: "overrides",
      title: "Location Overrides",
      description: "Per-location/route AI rules",
      icon: MapPin,
      color: "bg-amber",
    },
    {
      id: "preview",
      title: "AI Preview",
      description: "Test before publishing",
      icon: PlayCircle,
      color: "bg-muted-indigo",
    },
    {
      id: "model",
      title: "Model & Embeddings",
      description: "Technical AI configuration",
      icon: Settings2,
      color: "bg-terracotta",
    },
    {
      id: "logs",
      title: "Logs",
      description: "RAG & safety monitoring",
      icon: FileText,
      color: "bg-forest-teal",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="AI Settings" showSearch={false} />

      <main className="pt-14 pb-24 px-4 max-w-6xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin")}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Admin
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted-indigo to-forest-teal flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Control Panel</h1>
            <p className="text-muted-foreground text-sm">
              Manage tone, safety, behavior, sources & modes for Ask Rwanda
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tones">Tone Profiles</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="modes">Mode Behavior</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="overrides">Overrides</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card
                    key={section.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setActiveTab(section.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{section.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {section.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* Help & Docs Section */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-base">Help & Documentation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <button 
                    className="text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    onClick={() => setActiveTab("help")}
                  >
                    <p className="font-medium">How AI uses content</p>
                    <p className="text-xs text-muted-foreground">RAG and content retrieval</p>
                  </button>
                  <button 
                    className="text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    onClick={() => setActiveTab("help")}
                  >
                    <p className="font-medium">Best practices for safe tone</p>
                    <p className="text-xs text-muted-foreground">Trauma-aware configuration</p>
                  </button>
                  <button 
                    className="text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    onClick={() => setActiveTab("help")}
                  >
                    <p className="font-medium">RAG troubleshooting</p>
                    <p className="text-xs text-muted-foreground">Common issues and fixes</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tones">
            <ToneProfilesPanel />
          </TabsContent>

          <TabsContent value="safety">
            <SafetySettingsPanel />
          </TabsContent>

          <TabsContent value="modes">
            <ModeConfigPanel />
          </TabsContent>

          <TabsContent value="sources">
            <SourceRulesPanel />
          </TabsContent>

          <TabsContent value="overrides">
            <LocationOverridesPanel />
          </TabsContent>

          <TabsContent value="preview">
            <AIPreviewPanel />
          </TabsContent>

          <TabsContent value="model">
            <ModelSettingsPanel />
          </TabsContent>

          <TabsContent value="logs">
            <AILogsPanel />
          </TabsContent>

          <TabsContent value="help">
            <HelpDocsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
