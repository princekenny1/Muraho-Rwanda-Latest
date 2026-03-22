import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Save,
  Send,
  Upload,
  Loader2,
  AlertTriangle,
  Play,
  Mic,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTestimonies, Testimony } from "@/hooks/useTestimonies";
import { useTestimonyAdmin } from "@/hooks/useTestimonyAdmin";
import { UniversalTagPicker } from "./UniversalTagPicker";
import { MediaUpload } from "@/components/admin/routes/MediaUpload";
import { api } from "@/lib/api/client";

interface TestimonyEditorProps {
  testimonyId?: string | null;
  onClose: () => void;
}

const categories = [
  { value: "survivor", label: "Survivor" },
  { value: "rescuer", label: "Rescuer" },
  { value: "witness", label: "Witness" },
  { value: "reconciliation", label: "Reconciliation" },
  { value: "second_generation", label: "Second Generation" },
];

export function TestimonyEditor({
  testimonyId,
  onClose,
}: TestimonyEditorProps) {
  const { toast } = useToast();
  const { data: testimonies = [] } = useTestimonies();
  const { createTestimony, updateTestimony } = useTestimonyAdmin();
  const isEditing = !!testimonyId;

  const existingTestimony = testimonies?.find((t) => t.id === testimonyId);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<Partial<Testimony>>({
    defaultValues: {
      person_name: "",
      title: "",
      slug: "",
      context: "",
      cover_image: "",
      category: "survivor",
      location: "",
      year: undefined,
      duration_minutes: undefined,
      has_content_warning: true,
      is_featured: false,
      video_url: "",
      transcript_segments: [],
      sources: [],
    },
  });

  useEffect(() => {
    if (existingTestimony) {
      form.reset({
        person_name: existingTestimony.person_name,
        title: existingTestimony.title,
        slug: existingTestimony.slug,
        context: existingTestimony.context,
        cover_image: existingTestimony.cover_image,
        category: existingTestimony.category,
        location: existingTestimony.location || "",
        year: existingTestimony.year || undefined,
        duration_minutes: existingTestimony.duration_minutes || undefined,
        has_content_warning: existingTestimony.has_content_warning,
        is_featured: existingTestimony.is_featured || false,
        video_url: existingTestimony.video_url || "",
        transcript_segments: existingTestimony.transcript_segments || [],
        sources: existingTestimony.sources || [],
      });
    }
  }, [existingTestimony, form]);

  const generateSlug = (name: string, title: string) => {
    const combined = `${name} ${title}`;
    return combined
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handlePersonNameChange = (name: string) => {
    form.setValue("person_name", name);
    const title = form.getValues("title");
    if (!isEditing) {
      form.setValue("slug", generateSlug(name, title));
    }
  };

  const handleTitleChange = (title: string) => {
    form.setValue("title", title);
    const name = form.getValues("person_name");
    if (!isEditing) {
      form.setValue("slug", generateSlug(name, title));
    }
  };

  const handleTranscribe = async () => {
    const videoUrl = form.getValues("video_url");
    if (!videoUrl) {
      toast({
        title: "No media uploaded",
        description: "Please upload a video or audio file first.",
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);
    setTranscriptionProgress(0);

    try {
      // Simulate transcription progress (in real implementation, this would be a webhook)
      const progressInterval = setInterval(() => {
        setTranscriptionProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch(`${api.baseURL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "transcribe", url: videoUrl }),
      });

      clearInterval(progressInterval);
      setTranscriptionProgress(100);

      if (!response.ok) throw new Error("Transcription request failed");
      const data = await response.json();

      if (data?.transcript) {
        // Parse transcript into segments
        const segments = data.transcript
          .split(". ")
          .map((text: string, index: number) => ({
            start: index * 10,
            end: (index + 1) * 10,
            text: text.trim() + (text.endsWith(".") ? "" : "."),
          }));
        form.setValue("transcript_segments", segments);
        toast({ title: "Transcription complete!" });
      }
    } catch (error: any) {
      toast({
        title: "Transcription failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
      setTranscriptionProgress(0);
    }
  };

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    try {
      const values = form.getValues();

      if (isEditing && testimonyId) {
        await updateTestimony.mutateAsync({
          id: testimonyId,
          ...values,
        } as any);
      } else {
        await createTestimony.mutateAsync(values as any);
      }

      toast({
        title: publish ? "Testimony published!" : "Testimony saved",
        description: publish
          ? "The testimony is now live."
          : "Draft saved successfully.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error saving testimony",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const transcriptSegments = form.watch("transcript_segments") || [];

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Testimony" : "Add New Testimony"}
          </h1>
          <p className="text-muted-foreground">
            Audio or video testimony with transcription
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isSaving}>
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Speaker Info */}
        <Card>
          <CardHeader>
            <CardTitle>Speaker Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Speaker Name *</Label>
                <Input
                  value={form.watch("person_name")}
                  onChange={(e) => handlePersonNameChange(e.target.value)}
                  placeholder="Full name of the speaker"
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(value) => form.setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.watch("title")}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., 'Story of Survival'"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  {...form.register("slug")}
                  placeholder="url-friendly-slug"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  {...form.register("location")}
                  placeholder="Where recorded"
                />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  {...form.register("year", { valueAsNumber: true })}
                  placeholder="1994"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  {...form.register("duration_minutes", {
                    valueAsNumber: true,
                  })}
                  placeholder="15"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Context *</Label>
              <Textarea
                {...form.register("context")}
                placeholder="Brief context about this testimony..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Media Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Video or Audio File</Label>
              <MediaUpload
                value={form.watch("video_url")}
                onChange={(url) => form.setValue("video_url", url || "")}
                mediaType="video"
                folder="testimonies"
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image / Poster</Label>
              <MediaUpload
                value={form.watch("cover_image")}
                onChange={(url) => form.setValue("cover_image", url || "")}
                mediaType="image"
                folder="testimonies"
              />
            </div>

            {form.watch("video_url") && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Auto-Transcription</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate transcript using AI
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mic className="h-4 w-4 mr-2" />
                    )}
                    {isTranscribing ? "Transcribing..." : "Transcribe"}
                  </Button>
                </div>

                {isTranscribing && (
                  <div className="space-y-2">
                    <Progress value={transcriptionProgress} />
                    <p className="text-sm text-muted-foreground text-center">
                      {transcriptionProgress}% complete
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            {transcriptSegments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transcript yet.</p>
                <p className="text-sm">
                  Upload media and click "Transcribe" or paste manually below.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transcriptSegments.map((segment: any, index: number) => (
                  <div
                    key={index}
                    className="flex gap-3 p-2 rounded hover:bg-muted/50"
                  >
                    <Badge variant="outline" className="shrink-0">
                      {Math.floor(segment.start / 60)}:
                      {String(segment.start % 60).padStart(2, "0")}
                    </Badge>
                    <p className="text-sm">{segment.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <Label>Manual Transcript (paste full text)</Label>
              <Textarea
                className="mt-2"
                placeholder="Paste the full transcript here..."
                rows={6}
                onChange={(e) => {
                  const text = e.target.value;
                  const segments = text.split(". ").map((t, i) => ({
                    time: i * 10,
                    text: t.trim() + (t.endsWith(".") ? "" : "."),
                  }));
                  form.setValue("transcript_segments", segments);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sensitive Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Content Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch("has_content_warning")}
                onCheckedChange={(checked) =>
                  form.setValue("has_content_warning", checked)
                }
              />
              <Label>Contains sensitive content</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Enable this if the testimony contains graphic descriptions,
              emotional content, or material that may require viewer discretion.
            </p>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch("is_featured")}
                onCheckedChange={(checked) =>
                  form.setValue("is_featured", checked)
                }
              />
              <Label>Featured Testimony</Label>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {testimonyId && (
          <Card>
            <CardHeader>
              <CardTitle>Tags & Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <UniversalTagPicker
                contentId={testimonyId}
                contentType="testimony"
                allowedTagTypes={["theme", "location", "person", "event"]}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
