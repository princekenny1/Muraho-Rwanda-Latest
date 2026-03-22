import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Eye, Loader2, Building2, MapPin, Home, LayoutGrid, Image, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMuseum, useMuseumMutations } from "@/hooks/useMuseumAdmin";
import { MuseumOutdoorTab } from "@/components/admin/museum/MuseumOutdoorTab";
import { MuseumRoomsTab } from "@/components/admin/museum/MuseumRoomsTab";
import { MuseumSettingsTab } from "@/components/admin/museum/MuseumSettingsTab";
import { MuseumPreviewTab } from "@/components/admin/museum/MuseumPreviewTab";

export default function MuseumBuilder() {
  const navigate = useNavigate();
  const { museumId } = useParams();
  const { data: museum, isLoading } = useMuseum(museumId);
  const { updateMuseum } = useMuseumMutations();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);

  // Local form state
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Initialize form data when museum loads
  useState(() => {
    if (museum) {
      setFormData({
        name: museum.name,
        short_description: museum.short_description || "",
        description: museum.description || "",
        address: museum.address || "",
        history_summary: museum.history_summary || "",
        mission: museum.mission || "",
        visitor_guidance: museum.visitor_guidance || "",
        safety_notice: museum.safety_notice || "",
        etiquette: museum.etiquette || "",
      });
    }
  });

  const handleSaveOverview = async () => {
    if (!museumId) return;
    setIsSaving(true);
    await updateMuseum.mutateAsync({
      id: museumId,
      ...formData,
    });
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center gap-4 px-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-6 w-48" />
          </div>
        </header>
        <div className="container px-4 py-8">
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!museum) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Museum not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/museums")}>
            Back to Museums
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/museums")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{museum.name}</h1>
              <p className="text-sm text-muted-foreground">Museum Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/museums/${museum.slug}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="outdoor" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Outdoor</span>
            </TabsTrigger>
            <TabsTrigger value="indoor" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Indoor</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>General details about the museum</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Museum Name</Label>
                    <Input
                      id="name"
                      value={formData.name || museum.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || museum.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description || museum.short_description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, short_description: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || museum.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Sections</CardTitle>
                <CardDescription>Educational and visitor information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="history_summary">History Summary</Label>
                  <Textarea
                    id="history_summary"
                    value={formData.history_summary || museum.history_summary || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, history_summary: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mission">Mission & Significance</Label>
                  <Textarea
                    id="mission"
                    value={formData.mission || museum.mission || ""}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitor_guidance">Visitor Guidance</Label>
                  <Textarea
                    id="visitor_guidance"
                    value={formData.visitor_guidance || museum.visitor_guidance || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, visitor_guidance: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="safety_notice">Safety Notice (Sensitive Content)</Label>
                  <Textarea
                    id="safety_notice"
                    value={formData.safety_notice || museum.safety_notice || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, safety_notice: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etiquette">Visitor Etiquette</Label>
                  <Textarea
                    id="etiquette"
                    value={formData.etiquette || museum.etiquette || ""}
                    onChange={(e) => setFormData({ ...formData, etiquette: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveOverview} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Overview
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Outdoor Stops Tab */}
          <TabsContent value="outdoor">
            <MuseumOutdoorTab museumId={museumId!} museum={museum} />
          </TabsContent>

          {/* Indoor Exhibitions Tab */}
          <TabsContent value="indoor">
            <MuseumRoomsTab museumId={museumId!} />
          </TabsContent>

          {/* Media Library Tab */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Media Library</CardTitle>
                <CardDescription>Manage images, videos, and audio files</CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Media library coming soon</p>
                <p className="text-sm">Upload and organize media for your museum content</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <MuseumSettingsTab museumId={museumId!} museum={museum} />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <MuseumPreviewTab museum={museum} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
