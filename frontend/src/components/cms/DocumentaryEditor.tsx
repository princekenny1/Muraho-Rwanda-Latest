import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Save,
  Send,
  Plus,
  Trash2,
  Film,
  Play,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useDocumentaries, Documentary } from "@/hooks/useDocumentaries";
import { useDocumentaryAdmin } from "@/hooks/useDocumentaryAdmin";
import { useContentCMS, DocumentaryClip } from "@/hooks/useContentCMS";
import { UniversalTagPicker } from "./UniversalTagPicker";
import { MediaUpload } from "@/components/admin/routes/MediaUpload";

interface DocumentaryEditorProps {
  documentaryId?: string | null;
  onClose: () => void;
}

const documentaryTypes = [
  { value: "historical", label: "Historical Documentary" },
  { value: "contemporary", label: "Contemporary Documentary" },
  { value: "short_film", label: "Short Film" },
  { value: "educational", label: "Educational" },
  { value: "memorial", label: "Memorial" },
];

export function DocumentaryEditor({
  documentaryId,
  onClose,
}: DocumentaryEditorProps) {
  const { toast } = useToast();
  const { data: documentaries = [] } = useDocumentaries();
  const { createDocumentary, updateDocumentary } = useDocumentaryAdmin();
  const cms = useContentCMS();

  const isEditing = !!documentaryId;
  const existingDocumentary = documentaries?.find(
    (d) => d.id === documentaryId,
  );
  const { data: clips = [] } = cms.useDocumentaryClips(documentaryId || "");

  const [localClips, setLocalClips] = useState<Partial<DocumentaryClip>[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<Partial<Documentary>>({
    defaultValues: {
      title: "",
      slug: "",
      synopsis: "",
      cover_image: "",
      director: "",
      year: new Date().getFullYear(),
      runtime: 60,
      type: "historical",
      is_featured: false,
      is_new: true,
    },
  });

  useEffect(() => {
    if (existingDocumentary) {
      form.reset({
        title: existingDocumentary.title,
        slug: existingDocumentary.slug,
        synopsis: existingDocumentary.synopsis,
        cover_image: existingDocumentary.cover_image,
        director: existingDocumentary.director || "",
        year: existingDocumentary.year,
        runtime: existingDocumentary.runtime,
        type: existingDocumentary.type,
        is_featured: existingDocumentary.is_featured || false,
        is_new: existingDocumentary.is_new || false,
      });
    }
  }, [existingDocumentary, form]);

  useEffect(() => {
    setLocalClips(clips);
  }, [clips]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    form.setValue("title", title);
    if (!isEditing) {
      form.setValue("slug", generateSlug(title));
    }
  };

  const handleAddClip = () => {
    setLocalClips([
      ...localClips,
      {
        id: `temp-${Date.now()}`,
        title: "",
        description: "",
        video_url: "",
        is_trailer: false,
        clip_order: localClips.length + 1,
      },
    ]);
  };

  const handleUpdateClip = (
    index: number,
    updates: Partial<DocumentaryClip>,
  ) => {
    const newClips = [...localClips];
    newClips[index] = { ...newClips[index], ...updates };
    setLocalClips(newClips);
  };

  const handleDeleteClip = (index: number) => {
    setLocalClips(localClips.filter((_, i) => i !== index));
  };

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    try {
      const values = form.getValues();

      let savedDocId = documentaryId;

      if (isEditing && documentaryId) {
        await updateDocumentary.mutateAsync({
          id: documentaryId,
          ...values,
        } as any);
      } else {
        const newDoc = await createDocumentary.mutateAsync(values as any);
        savedDocId = newDoc.id;
      }

      // Save clips
      if (savedDocId) {
        for (const clip of localClips) {
          if (clip.id?.startsWith("temp-")) {
            await cms.createDocumentaryClip.mutateAsync({
              documentary_id: savedDocId,
              title: clip.title || "",
              description: clip.description,
              video_url: clip.video_url || "",
              is_trailer: clip.is_trailer || false,
              clip_order: clip.clip_order || 1,
            } as any);
          } else if (clip.id) {
            await cms.updateDocumentaryClip.mutateAsync({
              id: clip.id,
              documentaryId: savedDocId,
              ...clip,
            } as any);
          }
        }
      }

      toast({
        title: "Documentary saved",
        description: publish
          ? "The documentary is now published."
          : "Draft saved successfully.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error saving documentary",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Documentary" : "Add New Documentary"}
          </h1>
          <p className="text-muted-foreground">
            Full-length films with clips and trailers
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
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Documentary Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.watch("title")}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Documentary title"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input {...form.register("slug")} placeholder="url-slug" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Director</Label>
                <Input
                  {...form.register("director")}
                  placeholder="Director name"
                />
              </div>
              <div className="space-y-2">
                <Label>Year *</Label>
                <Input
                  type="number"
                  {...form.register("year", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Runtime (minutes) *</Label>
                <Input
                  type="number"
                  {...form.register("runtime", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value) => form.setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentaryTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Synopsis *</Label>
              <Textarea
                {...form.register("synopsis")}
                placeholder="Brief description of the documentary..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <MediaUpload
                value={form.watch("cover_image")}
                onChange={(url) => form.setValue("cover_image", url || "")}
                mediaType="image"
                folder="documentaries"
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.watch("is_featured")}
                  onCheckedChange={(checked) =>
                    form.setValue("is_featured", checked)
                  }
                />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.watch("is_new")}
                  onCheckedChange={(checked) =>
                    form.setValue("is_new", checked)
                  }
                />
                <Label>New Release</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Clips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Video Clips & Trailers
            </CardTitle>
            <Button variant="outline" onClick={handleAddClip}>
              <Plus className="h-4 w-4 mr-2" />
              Add Clip
            </Button>
          </CardHeader>
          <CardContent>
            {localClips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No clips added yet.</p>
                <p className="text-sm">
                  Add trailers, key clips, or behind-the-scenes content.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {localClips.map((clip, index) => (
                  <div
                    key={clip.id || index}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Badge
                          variant={clip.is_trailer ? "default" : "secondary"}
                        >
                          {clip.is_trailer ? "Trailer" : `Clip ${index + 1}`}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteClip(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={clip.title || ""}
                          onChange={(e) =>
                            handleUpdateClip(index, { title: e.target.value })
                          }
                          placeholder="Clip title"
                        />
                      </div>
                      <div className="space-y-2 flex items-end">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={clip.is_trailer || false}
                            onCheckedChange={(checked) =>
                              handleUpdateClip(index, { is_trailer: checked })
                            }
                          />
                          <Label>Is Trailer</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Video</Label>
                      <MediaUpload
                        value={clip.video_url}
                        onChange={(url) =>
                          handleUpdateClip(index, { video_url: url || "" })
                        }
                        mediaType="video"
                        folder="documentaries"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={clip.description || ""}
                        onChange={(e) =>
                          handleUpdateClip(index, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief description"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        {documentaryId && (
          <Card>
            <CardHeader>
              <CardTitle>Tags & Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <UniversalTagPicker
                contentId={documentaryId}
                contentType="documentary"
                allowedTagTypes={["theme", "location", "person", "event"]}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
