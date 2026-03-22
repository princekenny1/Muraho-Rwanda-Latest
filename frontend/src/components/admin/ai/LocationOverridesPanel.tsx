import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAISourceRules, useUpdateSourceRule, useCreateSourceRule, AIMode } from "@/hooks/useAISettings";
import { Loader2, MapPin, Navigation, Plus, Settings } from "lucide-react";

interface LocationOverride {
  id: string;
  name: string;
  type: "location" | "route";
  tone_override: AIMode | null;
  include_panels: boolean;
  include_stories: boolean;
  include_testimonies: boolean;
  safety_preface: string | null;
  custom_instructions: string | null;
}

export function LocationOverridesPanel() {
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ["admin-routes-list"],
    queryFn: async () => {
      const res = await api.find("routes", { sort: "title", limit: 200 });
      return res.docs.map((r: any) => ({ id: r.id, title: r.title, slug: r.slug }));
    },
  });

  const { data: exhibitions, isLoading: exhibitionsLoading } = useQuery({
    queryKey: ["admin-exhibitions-list"],
    queryFn: async () => {
      const res = await api.find("museum-exhibits", { sort: "exhibitionName", limit: 200 });
      return res.docs.map((e: any) => ({ id: e.id, title: e.exhibitionName || e.title }));
    },
  });

  const { data: sourceRules, isLoading: rulesLoading } = useAISourceRules();
  const updateRule = useUpdateSourceRule();
  const createRule = useCreateSourceRule();

  const [selectedType, setSelectedType] = useState<"location" | "route">("location");
  const [selectedId, setSelectedId] = useState<string>("");
  const [editingOverride, setEditingOverride] = useState<Partial<LocationOverride> | null>(null);
  const [localSettings, setLocalSettings] = useState({
    overrideGlobalTone: false,
    toneOverride: "standard" as AIMode,
    includePanels: true,
    includeStories: true,
    includeTestimonies: false,
    safetyPreface: "",
    requireSafetyPreface: true,
  });

  // Find existing rule for selected location/route
  const existingRule = sourceRules?.find(
    (r) => r.rule_type === selectedType && r.target_id === selectedId
  );

  useEffect(() => {
    if (existingRule) {
      setLocalSettings({
        overrideGlobalTone: !!existingRule.tone_override,
        toneOverride: existingRule.tone_override || "standard",
        includePanels: existingRule.include_panels,
        includeStories: existingRule.include_stories,
        includeTestimonies: existingRule.include_testimonies,
        safetyPreface: existingRule.custom_instructions || "",
        requireSafetyPreface: !!existingRule.custom_instructions,
      });
    } else {
      setLocalSettings({
        overrideGlobalTone: false,
        toneOverride: "standard",
        includePanels: true,
        includeStories: true,
        includeTestimonies: false,
        safetyPreface: "",
        requireSafetyPreface: true,
      });
    }
  }, [existingRule, selectedId]);

  const handleSave = async () => {
    const ruleData = {
      rule_name: selectedType === "location" 
        ? exhibitions?.find((e) => e.id === selectedId)?.title || "Location Override"
        : routes?.find((r) => r.id === selectedId)?.title || "Route Override",
      rule_type: selectedType,
      target_id: selectedId,
      tone_override: localSettings.overrideGlobalTone ? localSettings.toneOverride : null,
      include_panels: localSettings.includePanels,
      include_stories: localSettings.includeStories,
      include_testimonies: localSettings.includeTestimonies,
      include_routes: true,
      include_ar_content: false,
      include_drafts: false,
      custom_instructions: localSettings.requireSafetyPreface ? localSettings.safetyPreface : null,
      is_active: true,
    };

    if (existingRule) {
      updateRule.mutate({ id: existingRule.id, updates: ruleData });
    } else {
      createRule.mutate(ruleData);
    }
  };

  const isLoading = routesLoading || exhibitionsLoading || rulesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const locationOptions = exhibitions || [];
  const routeOptions = routes || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Location & Route Overrides</h3>
        <p className="text-sm text-muted-foreground">
          Configure custom AI behavior for specific locations or routes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Location or Route</CardTitle>
          <CardDescription>
            Choose a location or route to customize AI behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={selectedType}
                onValueChange={(val: "location" | "route") => {
                  setSelectedType(val);
                  setSelectedId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location / Exhibition
                    </div>
                  </SelectItem>
                  <SelectItem value="route">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Route
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {selectedType === "location" ? "Location" : "Route"}
              </Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedType === "location"
                    ? locationOptions.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.title}
                        </SelectItem>
                      ))
                    : routeOptions.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.title}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {existingRule && (
            <Badge variant="secondary" className="mt-2">
              Has custom settings
            </Badge>
          )}
        </CardContent>
      </Card>

      {selectedId && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-indigo" />
              <CardTitle className="text-base">Local Settings</CardTitle>
            </div>
            <CardDescription>
              Configure AI behavior for{" "}
              {selectedType === "location"
                ? locationOptions.find((l) => l.id === selectedId)?.title
                : routeOptions.find((r) => r.id === selectedId)?.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tone Override */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Override Global Tone?</Label>
                  <p className="text-xs text-muted-foreground">
                    Use a different tone for this {selectedType}
                  </p>
                </div>
                <Switch
                  checked={localSettings.overrideGlobalTone}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, overrideGlobalTone: checked })
                  }
                />
              </div>

              {localSettings.overrideGlobalTone && (
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  <Label>Tone Profile</Label>
                  <Select
                    value={localSettings.toneOverride}
                    onValueChange={(val: AIMode) =>
                      setLocalSettings({ ...localSettings, toneOverride: val })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="personal_voices">Personal Voices</SelectItem>
                      <SelectItem value="kid_friendly">Kid-Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Content Allowed */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Content Allowed</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Panels</Label>
                  <Switch
                    checked={localSettings.includePanels}
                    onCheckedChange={(checked) =>
                      setLocalSettings({ ...localSettings, includePanels: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Stories</Label>
                  <Switch
                    checked={localSettings.includeStories}
                    onCheckedChange={(checked) =>
                      setLocalSettings({ ...localSettings, includeStories: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-normal">Testimonies</Label>
                    <p className="text-xs text-muted-foreground">Sensitive content</p>
                  </div>
                  <Switch
                    checked={localSettings.includeTestimonies}
                    onCheckedChange={(checked) =>
                      setLocalSettings({ ...localSettings, includeTestimonies: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Safety Preface */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Safety Preface Required</Label>
                  <p className="text-xs text-muted-foreground">
                    Show a respectful introduction before AI responds
                  </p>
                </div>
                <Switch
                  checked={localSettings.requireSafetyPreface}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, requireSafetyPreface: checked })
                  }
                />
              </div>

              {localSettings.requireSafetyPreface && (
                <div className="space-y-2">
                  <Label>Local Safety Message</Label>
                  <Textarea
                    value={localSettings.safetyPreface}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, safetyPreface: e.target.value })
                    }
                    placeholder="This site carries deep history. I will explain respectfully and carefully."
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={updateRule.isPending || createRule.isPending}
            >
              {(updateRule.isPending || createRule.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Overrides
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
