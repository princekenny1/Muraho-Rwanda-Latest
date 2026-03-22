import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAISafetySettings, useUpdateSafetySettings } from "@/hooks/useAISettings";
import { Loader2, Shield, ShieldAlert, AlertTriangle, Plus, X } from "lucide-react";

const DEFAULT_SENSITIVE_THEMES = [
  { id: "genocide", label: "Genocide history", checked: true },
  { id: "memorial", label: "Memorial stories", checked: true },
  { id: "violence", label: "Violence-related content", checked: true },
  { id: "trauma", label: "Trauma / PTSD triggers", checked: true },
  { id: "cultural", label: "Cultural beliefs", checked: false },
  { id: "nature", label: "Nature / geography", checked: false },
];

export function SafetySettingsPanel() {
  const { data: settings, isLoading } = useAISafetySettings();
  const updateSettings = useUpdateSafetySettings();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [newTheme, setNewTheme] = useState("");
  const [newRule, setNewRule] = useState("");
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      // Extract custom rules from safety_guidelines if they exist
      const guidelines = settings.safety_guidelines || "";
      const rules = guidelines.split("\n").filter((line) => line.startsWith("- "));
      setCustomRules(rules.map((r) => r.replace("- ", "")));
    }
  }, [settings]);

  const handleSave = () => {
    if (!localSettings) return;
    
    // Combine custom rules back into safety_guidelines
    const baseGuidelines = (localSettings.safety_guidelines || "")
      .split("\n")
      .filter((line) => !line.startsWith("- "))
      .join("\n")
      .trim();
    
    const rulesSection = customRules.length > 0 
      ? "\n\nCustom Rules:\n" + customRules.map((r) => `- ${r}`).join("\n")
      : "";
    
    updateSettings.mutate({
      id: localSettings.id,
      updates: {
        enable_harm_sensitivity: localSettings.enable_harm_sensitivity,
        enable_trauma_aware_language: localSettings.enable_trauma_aware_language,
        hide_graphic_in_kid_mode: localSettings.hide_graphic_in_kid_mode,
        allow_raw_testimonies: localSettings.allow_raw_testimonies,
        safety_guidelines: baseGuidelines + rulesSection,
        sensitive_themes: localSettings.sensitive_themes,
      },
    });
    setHasChanges(false);
  };

  const updateLocalSetting = (key: string, value: any) => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, [key]: value });
    setHasChanges(true);
  };

  const addTheme = () => {
    if (!newTheme.trim() || !localSettings) return;
    const themes = [...(localSettings.sensitive_themes || []), newTheme.trim()];
    updateLocalSetting("sensitive_themes", themes);
    setNewTheme("");
  };

  const removeTheme = (theme: string) => {
    if (!localSettings) return;
    const themes = localSettings.sensitive_themes.filter((t) => t !== theme);
    updateLocalSetting("sensitive_themes", themes);
  };

  const addCustomRule = () => {
    if (!newRule.trim()) return;
    setCustomRules([...customRules, newRule.trim()]);
    setNewRule("");
    setHasChanges(true);
  };

  const removeCustomRule = (rule: string) => {
    setCustomRules(customRules.filter((r) => r !== rule));
    setHasChanges(true);
  };

  if (isLoading || !localSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Safety & Sensitivity</h3>
          <p className="text-sm text-muted-foreground">
            Control how the AI handles emotionally sensitive content
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        )}
      </div>

      {/* Global Safety Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-indigo" />
            <CardTitle className="text-base">Global Safety Settings</CardTitle>
          </div>
          <CardDescription>
            Core safety features applied across all modes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Trauma-sensitive language</Label>
              <p className="text-xs text-muted-foreground">
                Uses respectful, survivor-informed terminology
              </p>
            </div>
            <Switch
              checked={localSettings.enable_trauma_aware_language}
              onCheckedChange={(checked) =>
                updateLocalSetting("enable_trauma_aware_language", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic safety notice</Label>
              <p className="text-xs text-muted-foreground">
                Shows content warning for sensitive questions
              </p>
            </div>
            <Switch
              checked={localSettings.enable_harm_sensitivity}
              onCheckedChange={(checked) =>
                updateLocalSetting("enable_harm_sensitivity", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Filter explicit descriptions</Label>
              <p className="text-xs text-muted-foreground">
                Replaces graphic details with softer language
              </p>
            </div>
            <Switch
              checked={localSettings.hide_graphic_in_kid_mode}
              onCheckedChange={(checked) =>
                updateLocalSetting("hide_graphic_in_kid_mode", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>Allow raw testimonies</Label>
                <Badge variant="destructive" className="text-xs">Admin Only</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Permits unfiltered testimony content (use with caution)
              </p>
            </div>
            <Switch
              checked={localSettings.allow_raw_testimonies}
              onCheckedChange={(checked) =>
                updateLocalSetting("allow_raw_testimonies", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Themes to Always Soften */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber" />
            <CardTitle className="text-base">Themes to Always Soften</CardTitle>
          </div>
          <CardDescription>
            Topics that trigger additional care in AI responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {DEFAULT_SENSITIVE_THEMES.map((theme) => {
              const isActive = localSettings.sensitive_themes?.includes(theme.label) ?? theme.checked;
              return (
                <div key={theme.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={theme.id}
                    checked={isActive}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateLocalSetting("sensitive_themes", [
                          ...(localSettings.sensitive_themes || []),
                          theme.label,
                        ]);
                      } else {
                        updateLocalSetting(
                          "sensitive_themes",
                          localSettings.sensitive_themes?.filter((t) => t !== theme.label) || []
                        );
                      }
                    }}
                  />
                  <Label htmlFor={theme.id} className="font-normal cursor-pointer">
                    {theme.label}
                  </Label>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Custom themes:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {localSettings.sensitive_themes
                ?.filter((t) => !DEFAULT_SENSITIVE_THEMES.some((d) => d.label === t))
                .map((theme) => (
                  <Badge key={theme} variant="secondary" className="pr-1">
                    {theme}
                    <button
                      onClick={() => removeTheme(theme)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom theme..."
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTheme()}
              />
              <Button variant="outline" size="icon" onClick={addTheme}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Safety Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-forest-teal" />
            <CardTitle className="text-base">Custom Safety Rules</CardTitle>
          </div>
          <CardDescription>
            Specific rules for AI behavior in sensitive contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customRules.length > 0 ? (
            <div className="space-y-2">
              {customRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30"
                >
                  <span className="flex-1 text-sm">{rule}</span>
                  <button
                    onClick={() => removeCustomRule(rule)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No custom rules configured
            </p>
          )}
          
          <div className="space-y-2">
            <Label>Add new rule:</Label>
            <div className="flex gap-2">
              <Input
                placeholder='e.g., "When discussing Memorial X, always begin with a respectful introduction."'
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomRule()}
              />
              <Button variant="outline" onClick={addCustomRule}>
                Add Rule
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Examples: "Avoid referencing Panel Y in Kid Mode" • "Always include content warning for testimonies from X location"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Safety Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Safety Guidelines Text</CardTitle>
          <CardDescription>
            Written guidelines included in AI system prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={(localSettings.safety_guidelines || "").split("\n\nCustom Rules:")[0]}
            onChange={(e) => {
              const rulesSection = (localSettings.safety_guidelines || "").includes("Custom Rules:")
                ? "\n\nCustom Rules:" + (localSettings.safety_guidelines || "").split("\n\nCustom Rules:")[1]
                : "";
              updateLocalSetting("safety_guidelines", e.target.value + rulesSection);
            }}
            rows={6}
            placeholder="Enter safety guidelines for the AI to follow..."
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            These guidelines are appended to all AI system prompts to ensure consistent safety behavior.
          </p>
        </CardContent>
      </Card>

      {/* Save Button (mobile-friendly) */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={handleSave} disabled={updateSettings.isPending} size="lg">
            {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
}
