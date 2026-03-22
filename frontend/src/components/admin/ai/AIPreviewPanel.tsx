import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAIToneProfiles,
  useAIModeConfigs,
  useAISafetySettings,
  AIMode,
} from "@/hooks/useAISettings";
import { api } from "@/lib/api/client";
import {
  Loader2,
  MessageSquare,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Send,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export function AIPreviewPanel() {
  const { data: toneProfiles } = useAIToneProfiles();
  const { data: modeConfigs } = useAIModeConfigs();
  const { data: safetySettings } = useAISafetySettings();

  const [question, setQuestion] = useState(
    "What is the Kigali Genocide Memorial?",
  );
  const [selectedMode, setSelectedMode] = useState<AIMode>("standard");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{
    content: string;
    tone: string;
    sources: string[];
    warnings: string[];
  } | null>(null);

  const handleTest = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const toneProfile = toneProfiles?.find((p) => p.mode === selectedMode);
      const modeConfig = modeConfigs?.find((c) => c.mode === selectedMode);

      // Call the ask-rwanda API endpoint (Next.js API route → FastAPI)
      const res = await fetch(`${api.baseURL}/ask-rwanda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: question,
          mode: selectedMode,
          isPreview: true,
        }),
      });

      if (!res.ok) throw new Error("AI preview request failed");
      const data = await res.json();

      setResponse({
        content: data.response || "No response generated",
        tone: toneProfile?.name || selectedMode,
        sources: data.sources || ["Stories", "Panels"],
        warnings: modeConfig?.block_sensitive_content
          ? ["Content filtered for safety"]
          : safetySettings?.enable_harm_sensitivity
            ? ["Harm sensitivity enabled"]
            : [],
      });
    } catch (error) {
      console.error("Preview error:", error);
      setResponse({
        content:
          "Failed to generate preview. Please check your AI configuration and try again.",
        tone: selectedMode,
        sources: [],
        warnings: ["Error occurred during generation"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">AI Preview Tool</h3>
        <p className="text-sm text-muted-foreground">
          Test Ask Rwanda responses before publishing changes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Configuration</CardTitle>
          <CardDescription>
            Enter a question and select a mode to preview AI behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter a test question..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Mode</Label>
              <Select
                value={selectedMode}
                onValueChange={(v) => setSelectedMode(v as AIMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="personal_voices">
                    Personal Voices
                  </SelectItem>
                  <SelectItem value="kid_friendly">Kid-Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleTest}
                disabled={isLoading || !question.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Generate Response
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                AI Response
              </CardTitle>
              <Badge variant="outline">{response.tone}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {response.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber/10 border border-amber/30 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber mt-0.5 shrink-0" />
                <div className="text-sm">
                  {response.warnings.map((warning, i) => (
                    <p key={i}>{warning}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{response.content}</ReactMarkdown>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sources:</span>
                <div className="flex gap-1">
                  {response.sources.length > 0 ? (
                    response.sources.map((source) => (
                      <Badge
                        key={source}
                        variant="secondary"
                        className="text-xs"
                      >
                        {source}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="text-adventure-green"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve Behavior
              </Button>
              <Button variant="ghost" size="sm">
                Adjust Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
