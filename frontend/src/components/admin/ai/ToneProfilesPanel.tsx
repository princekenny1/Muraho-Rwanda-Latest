import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAIToneProfiles, useUpdateToneProfile, AIToneProfile } from "@/hooks/useAISettings";
import { Loader2, Pencil, Eye, MessageSquare, Heart, Baby, ChevronDown, ChevronUp, Save } from "lucide-react";

const modeIcons = {
  standard: MessageSquare,
  personal_voices: Heart,
  kid_friendly: Baby,
};

const modeColors = {
  standard: "bg-muted-indigo",
  personal_voices: "bg-terracotta",
  kid_friendly: "bg-adventure-green",
};

const modeLabels = {
  standard: "STANDARD MODE",
  personal_voices: "PERSONAL VOICES MODE",
  kid_friendly: "KID-FRIENDLY MODE",
};

export function ToneProfilesPanel() {
  const { data: profiles, isLoading } = useAIToneProfiles();
  const updateProfile = useUpdateToneProfile();
  const [editingProfile, setEditingProfile] = useState<AIToneProfile | null>(null);
  const [previewProfile, setPreviewProfile] = useState<AIToneProfile | null>(null);
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);
  const [localEdits, setLocalEdits] = useState<Record<string, Partial<AIToneProfile>>>({});

  const handleSave = () => {
    if (!editingProfile) return;
    updateProfile.mutate({
      id: editingProfile.id,
      updates: {
        name: editingProfile.name,
        description: editingProfile.description,
        system_prompt: editingProfile.system_prompt,
        example_response: editingProfile.example_response,
        is_active: editingProfile.is_active,
      },
    });
    setEditingProfile(null);
  };

  const handleInlineSave = (profile: AIToneProfile) => {
    const edits = localEdits[profile.id];
    if (!edits) return;
    
    updateProfile.mutate({
      id: profile.id,
      updates: {
        system_prompt: edits.system_prompt ?? profile.system_prompt,
      },
    });
    setLocalEdits((prev) => {
      const next = { ...prev };
      delete next[profile.id];
      return next;
    });
  };

  const updateLocalEdit = (profileId: string, field: keyof AIToneProfile, value: string) => {
    setLocalEdits((prev) => ({
      ...prev,
      [profileId]: {
        ...prev[profileId],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tone Profiles</h3>
          <p className="text-sm text-muted-foreground">
            Define how the AI sounds across different user modes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {profiles?.map((profile) => {
          const Icon = modeIcons[profile.mode];
          const colorClass = modeColors[profile.mode];
          const isExpanded = expandedProfile === profile.id;
          const currentPrompt = localEdits[profile.id]?.system_prompt ?? profile.system_prompt;
          const hasUnsavedChanges = localEdits[profile.id]?.system_prompt !== undefined;
          
          return (
            <Card key={profile.id} className={!profile.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {modeLabels[profile.mode]}
                      </Badge>
                      {!profile.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {profile.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProfile(profile)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit Prompt
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewProfile(profile)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview Output
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Collapsible open={isExpanded} onOpenChange={() => setExpandedProfile(isExpanded ? null : profile.id)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span className="text-xs text-muted-foreground">Prompt Field</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <Textarea
                        value={currentPrompt}
                        onChange={(e) => updateLocalEdit(profile.id, "system_prompt", e.target.value)}
                        rows={4}
                        className="font-mono text-sm bg-transparent border-0 p-0 focus-visible:ring-0 resize-none"
                        placeholder="Enter system prompt..."
                      />
                    </div>
                    {hasUnsavedChanges && (
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLocalEdits((prev) => {
                              const next = { ...prev };
                              delete next[profile.id];
                              return next;
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleInlineSave(profile)}
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="pt-4 border-t">
        <Button variant="outline" disabled>
          + Add Custom Tone Profile
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Custom tone profiles coming soon
        </p>
      </div>

      {/* Edit Sheet */}
      <Sheet open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Tone Profile</SheetTitle>
            <SheetDescription>
              Customize the AI's communication style for {editingProfile?.name}
            </SheetDescription>
          </SheetHeader>

          {editingProfile && (
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Profile Name</Label>
                <Input
                  id="name"
                  value={editingProfile.name}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingProfile.description || ""}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={editingProfile.system_prompt}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, system_prompt: e.target.value })
                  }
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This prompt defines how the AI should respond. Include tone, style, and content guidelines.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="example">Example Response</Label>
                <Textarea
                  id="example"
                  value={editingProfile.example_response || ""}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, example_response: e.target.value })
                  }
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  An example of the desired response style for reference
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={editingProfile.is_active}
                  onCheckedChange={(checked) =>
                    setEditingProfile({ ...editingProfile, is_active: checked })
                  }
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleSave} disabled={updateProfile.isPending}>
                  {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingProfile(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Preview Sheet */}
      <Sheet open={!!previewProfile} onOpenChange={() => setPreviewProfile(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Example Response</SheetTitle>
            <SheetDescription>
              How {previewProfile?.name} mode responds
            </SheetDescription>
          </SheetHeader>

          {previewProfile && (
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-2">Question:</p>
                <p className="text-sm text-muted-foreground italic">
                  "What is the Kigali Genocide Memorial?"
                </p>
              </div>

              <div className="p-4 rounded-lg border">
                <p className="text-sm font-medium mb-2">AI Response:</p>
                <p className="text-sm leading-relaxed">
                  {previewProfile.example_response || "No example response configured."}
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
