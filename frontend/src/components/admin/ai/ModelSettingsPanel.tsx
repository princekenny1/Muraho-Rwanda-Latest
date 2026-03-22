import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAIModelSettings, useUpdateModelSettings } from "@/hooks/useAISettings";
import { Loader2, Cpu, Zap, Settings2 } from "lucide-react";

const availableModels = [
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (Fast)", description: "Balanced speed and capability" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Good multimodal + reasoning" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", description: "Fastest, lower cost" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "Most capable, slower" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini", description: "Balanced performance" },
  { value: "openai/gpt-5", label: "GPT-5", description: "Highest accuracy, expensive" },
];

export function ModelSettingsPanel() {
  const { data: settings, isLoading } = useAIModelSettings();
  const updateSettings = useUpdateModelSettings();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = () => {
    if (!localSettings) return;
    updateSettings.mutate({
      id: localSettings.id,
      updates: {
        model_name: localSettings.model_name,
        context_window: localSettings.context_window,
        default_temperature: localSettings.default_temperature,
        default_max_tokens: localSettings.default_max_tokens,
      },
    });
    setHasChanges(false);
  };

  const updateLocalSetting = (key: string, value: any) => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, [key]: value });
    setHasChanges(true);
  };

  if (isLoading || !localSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedModel = availableModels.find((m) => m.value === localSettings.model_name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Model & Embeddings</h3>
          <p className="text-sm text-muted-foreground">
            Technical AI configuration (advanced)
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-muted-indigo" />
            <CardTitle className="text-base">Model Selection</CardTitle>
          </div>
          <CardDescription>
            Choose the AI model that powers Ask Rwanda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select
              value={localSettings.model_name}
              onValueChange={(val) => updateLocalSetting("model_name", val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex flex-col">
                      <span>{model.label}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedModel && (
              <p className="text-xs text-muted-foreground">
                {selectedModel.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Context Window</Label>
              <span className="text-sm text-muted-foreground">
                {localSettings.context_window.toLocaleString()} tokens
              </span>
            </div>
            <Slider
              value={[localSettings.context_window]}
              onValueChange={([val]) => updateLocalSetting("context_window", val)}
              min={2000}
              max={32000}
              step={1000}
            />
            <p className="text-xs text-muted-foreground">
              Maximum tokens of context the model can process
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-forest-teal" />
            <CardTitle className="text-base">Default Parameters</CardTitle>
          </div>
          <CardDescription>
            Global defaults for AI responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Default Temperature</Label>
              <span className="text-sm text-muted-foreground">
                {localSettings.default_temperature}
              </span>
            </div>
            <Slider
              value={[Number(localSettings.default_temperature) * 100]}
              onValueChange={([val]) => updateLocalSetting("default_temperature", val / 100)}
              min={0}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Lower = more focused, Higher = more creative
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Default Max Tokens</Label>
              <span className="text-sm text-muted-foreground">
                {localSettings.default_max_tokens}
              </span>
            </div>
            <Slider
              value={[localSettings.default_max_tokens]}
              onValueChange={([val]) => updateLocalSetting("default_max_tokens", val)}
              min={128}
              max={2048}
              step={64}
            />
            <p className="text-xs text-muted-foreground">
              Maximum length of AI responses
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber" />
            <CardTitle className="text-base">Embedding Settings</CardTitle>
          </div>
          <CardDescription>
            Configuration for content retrieval (RAG)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Embedding Model</Label>
              <Input
                value={localSettings.embedding_model}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Similarity Function</Label>
              <Input
                value={localSettings.vector_similarity}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Embedding settings are managed by the system and cannot be changed directly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
