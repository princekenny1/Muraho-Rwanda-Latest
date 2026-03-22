import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAIModeConfigs, useUpdateModeConfig, AIModeConfig } from "@/hooks/useAISettings";
import { Loader2, Settings, MessageSquare, Heart, Baby, BookOpen, FileText, Users, MapPin } from "lucide-react";

const modeInfo = {
  standard: {
    icon: MessageSquare,
    color: "bg-muted-indigo",
    title: "Standard Mode",
    description: "Neutral, factual museum-style experience",
  },
  personal_voices: {
    icon: Heart,
    color: "bg-terracotta",
    title: "Personal Voices Mode",
    description: "Empathetic, testimony-focused experience",
  },
  kid_friendly: {
    icon: Baby,
    color: "bg-adventure-green",
    title: "Kid-Friendly Mode",
    description: "Safe, simplified language for young visitors",
  },
};

export function ModeConfigPanel() {
  const { data: configs, isLoading } = useAIModeConfigs();
  const updateConfig = useUpdateModeConfig();
  const [editingConfig, setEditingConfig] = useState<AIModeConfig | null>(null);

  const handleSave = () => {
    if (!editingConfig) return;
    updateConfig.mutate({
      id: editingConfig.id,
      updates: {
        max_answer_tokens: editingConfig.max_answer_tokens,
        temperature: editingConfig.temperature,
        include_stories: editingConfig.include_stories,
        include_panels: editingConfig.include_panels,
        include_testimonies: editingConfig.include_testimonies,
        include_routes: editingConfig.include_routes,
        prefer_testimonies: editingConfig.prefer_testimonies,
        block_sensitive_content: editingConfig.block_sensitive_content,
        use_simplified_language: editingConfig.use_simplified_language,
      },
    });
    setEditingConfig(null);
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
      <div>
        <h3 className="text-lg font-semibold">Mode Behavior</h3>
        <p className="text-sm text-muted-foreground">
          Configure how AI behaves in each "Choose Your Path" mode
        </p>
      </div>

      <div className="grid gap-4">
        {configs?.map((config) => {
          const info = modeInfo[config.mode];
          const Icon = info.icon;
          
          return (
            <Card key={config.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{info.title}</CardTitle>
                      <CardDescription className="text-xs">{info.description}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingConfig(config)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Max Tokens</p>
                    <p className="font-medium">{config.max_answer_tokens}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Temperature</p>
                    <p className="font-medium">{config.temperature}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Content Sources</p>
                    <div className="flex gap-1">
                      {config.include_stories && <BookOpen className="w-3 h-3" />}
                      {config.include_panels && <FileText className="w-3 h-3" />}
                      {config.include_testimonies && <Users className="w-3 h-3" />}
                      {config.include_routes && <MapPin className="w-3 h-3" />}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Special</p>
                    <p className="font-medium text-xs">
                      {config.block_sensitive_content && "🔒 Safe"}
                      {config.prefer_testimonies && "💬 Testimonies"}
                      {config.use_simplified_language && "📖 Simple"}
                      {!config.block_sensitive_content && !config.prefer_testimonies && !config.use_simplified_language && "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Sheet */}
      <Sheet open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Configure {editingConfig && modeInfo[editingConfig.mode].title}</SheetTitle>
            <SheetDescription>
              Adjust AI behavior and content selection for this mode
            </SheetDescription>
          </SheetHeader>

          {editingConfig && (
            <div className="space-y-6 mt-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Response Settings</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Max Answer Length</Label>
                    <span className="text-sm text-muted-foreground">
                      {editingConfig.max_answer_tokens} tokens
                    </span>
                  </div>
                  <Slider
                    value={[editingConfig.max_answer_tokens]}
                    onValueChange={([val]) =>
                      setEditingConfig({ ...editingConfig, max_answer_tokens: val })
                    }
                    min={128}
                    max={1024}
                    step={64}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Temperature (Creativity)</Label>
                    <span className="text-sm text-muted-foreground">
                      {editingConfig.temperature}
                    </span>
                  </div>
                  <Slider
                    value={[Number(editingConfig.temperature) * 100]}
                    onValueChange={([val]) =>
                      setEditingConfig({ ...editingConfig, temperature: val / 100 })
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm">Content Sources</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="stories">Include Stories</Label>
                    </div>
                    <Switch
                      id="stories"
                      checked={editingConfig.include_stories}
                      onCheckedChange={(checked) =>
                        setEditingConfig({ ...editingConfig, include_stories: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="panels">Include Museum Panels</Label>
                    </div>
                    <Switch
                      id="panels"
                      checked={editingConfig.include_panels}
                      onCheckedChange={(checked) =>
                        setEditingConfig({ ...editingConfig, include_panels: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="testimonies">Include Testimonies</Label>
                    </div>
                    <Switch
                      id="testimonies"
                      checked={editingConfig.include_testimonies}
                      onCheckedChange={(checked) =>
                        setEditingConfig({ ...editingConfig, include_testimonies: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="routes">Include Route Narratives</Label>
                    </div>
                    <Switch
                      id="routes"
                      checked={editingConfig.include_routes}
                      onCheckedChange={(checked) =>
                        setEditingConfig({ ...editingConfig, include_routes: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm">Special Behaviors</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prefer">Prefer Testimonies</Label>
                    <Switch
                      id="prefer"
                      checked={editingConfig.prefer_testimonies}
                      onCheckedChange={(checked) =>
                        setEditingConfig({ ...editingConfig, prefer_testimonies: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="block">Block Sensitive Content</Label>
                    <Switch
                      id="block"
                      checked={editingConfig.block_sensitive_content}
                      onCheckedChange={(checked) =>
                        setEditingConfig({ ...editingConfig, block_sensitive_content: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="simple">Use Simplified Language</Label>
                    <Switch
                      id="simple"
                      checked={editingConfig.use_simplified_language}
                      onCheckedChange={(checked) =>
                        setEditingConfig({ ...editingConfig, use_simplified_language: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={updateConfig.isPending}>
                  {updateConfig.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingConfig(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
