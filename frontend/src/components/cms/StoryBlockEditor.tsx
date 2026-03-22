import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { MediaUpload } from "@/components/admin/routes/MediaUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTestimonies } from "@/hooks/useTestimonies";
import { useContentCMS } from "@/hooks/useContentCMS";

interface StoryBlockEditorProps {
  blockType: string;
  content: Record<string, any>;
  onChange: (content: Record<string, any>) => void;
}

export function StoryBlockEditor({
  blockType,
  content,
  onChange,
}: StoryBlockEditorProps) {
  const { data: testimonies = [] } = useTestimonies();
  const cms = useContentCMS();
  const { data: stories = [] } = cms.useStories();

  const updateField = (field: string, value: any) => {
    onChange({ ...content, [field]: value });
  };

  switch (blockType) {
    case "text":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Heading (optional)</Label>
            <Input
              value={content.heading || ""}
              onChange={(e) => updateField("heading", e.target.value)}
              placeholder="Section heading"
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content.text || ""}
              onChange={(e) => updateField("text", e.target.value)}
              placeholder="Write your content here... (Markdown supported)"
              rows={6}
            />
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Image</Label>
            <MediaUpload
              value={content.url}
              onChange={(url) => updateField("url", url)}
              mediaType="image"
              folder="stories"
            />
          </div>
          <div className="space-y-2">
            <Label>Caption</Label>
            <Input
              value={content.caption || ""}
              onChange={(e) => updateField("caption", e.target.value)}
              placeholder="Image caption"
            />
          </div>
          <div className="space-y-2">
            <Label>Alt Text</Label>
            <Input
              value={content.alt || ""}
              onChange={(e) => updateField("alt", e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>
        </div>
      );

    case "gallery":
      const images = content.images || [];
      return (
        <div className="space-y-3">
          <Label>Gallery Images</Label>
          <div className="grid grid-cols-3 gap-3">
            {images.map(
              (img: { url: string; caption?: string }, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={img.url}
                    alt={img.caption || "Gallery image"}
                    className="w-full h-24 object-cover rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      const newImages = images.filter(
                        (_: any, i: number) => i !== index,
                      );
                      updateField("images", newImages);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ),
            )}
          </div>
          <MediaUpload
            value=""
            onChange={(url) => {
              if (url) {
                updateField("images", [...images, { url, caption: "" }]);
              }
            }}
            mediaType="image"
            folder="stories"
          />
        </div>
      );

    case "video":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Video</Label>
            <MediaUpload
              value={content.url}
              onChange={(url) => updateField("url", url)}
              mediaType="video"
              folder="stories"
            />
          </div>
          <div className="space-y-2">
            <Label>Or YouTube/Vimeo URL</Label>
            <Input
              value={content.external_url || ""}
              onChange={(e) => updateField("external_url", e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div className="space-y-2">
            <Label>Caption</Label>
            <Input
              value={content.caption || ""}
              onChange={(e) => updateField("caption", e.target.value)}
              placeholder="Video caption"
            />
          </div>
        </div>
      );

    case "audio":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Audio File</Label>
            <MediaUpload
              value={content.url}
              onChange={(url) => updateField("url", url)}
              mediaType="audio"
              folder="stories"
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={content.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Audio title"
            />
          </div>
          <div className="space-y-2">
            <Label>Transcript (optional)</Label>
            <Textarea
              value={content.transcript || ""}
              onChange={(e) => updateField("transcript", e.target.value)}
              placeholder="Audio transcript"
              rows={4}
            />
          </div>
        </div>
      );

    case "quote":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Quote Text</Label>
            <Textarea
              value={content.text || ""}
              onChange={(e) => updateField("text", e.target.value)}
              placeholder="Enter the quote..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Attribution</Label>
            <Input
              value={content.attribution || ""}
              onChange={(e) => updateField("attribution", e.target.value)}
              placeholder="Who said this?"
            />
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Input
              value={content.source || ""}
              onChange={(e) => updateField("source", e.target.value)}
              placeholder="Interview, book, speech, etc."
            />
          </div>
        </div>
      );

    case "timeline":
      const events = content.events || [];
      return (
        <div className="space-y-3">
          <Label>Timeline Events</Label>
          {events.map(
            (
              event: { date: string; title: string; description?: string },
              index: number,
            ) => (
              <div
                key={index}
                className="p-3 border rounded space-y-2 relative"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => {
                    const newEvents = events.filter(
                      (_: any, i: number) => i !== index,
                    );
                    updateField("events", newEvents);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                <Input
                  value={event.date}
                  onChange={(e) => {
                    const newEvents = [...events];
                    newEvents[index] = { ...event, date: e.target.value };
                    updateField("events", newEvents);
                  }}
                  placeholder="Date (e.g., April 1994)"
                />
                <Input
                  value={event.title}
                  onChange={(e) => {
                    const newEvents = [...events];
                    newEvents[index] = { ...event, title: e.target.value };
                    updateField("events", newEvents);
                  }}
                  placeholder="Event title"
                />
                <Textarea
                  value={event.description || ""}
                  onChange={(e) => {
                    const newEvents = [...events];
                    newEvents[index] = {
                      ...event,
                      description: e.target.value,
                    };
                    updateField("events", newEvents);
                  }}
                  placeholder="Description"
                  rows={2}
                />
              </div>
            ),
          )}
          <Button
            variant="outline"
            onClick={() => {
              updateField("events", [
                ...events,
                { date: "", title: "", description: "" },
              ]);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      );

    case "map":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={content.latitude || ""}
                onChange={(e) =>
                  updateField("latitude", parseFloat(e.target.value))
                }
                placeholder="-1.9403"
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={content.longitude || ""}
                onChange={(e) =>
                  updateField("longitude", parseFloat(e.target.value))
                }
                placeholder="29.8739"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location Name</Label>
            <Input
              value={content.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Kigali Genocide Memorial"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={content.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="About this location..."
              rows={2}
            />
          </div>
        </div>
      );

    case "then_now":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Historical Image ("Then")</Label>
              <MediaUpload
                value={content.then_image}
                onChange={(url) => updateField("then_image", url)}
                mediaType="image"
                folder="stories"
              />
              <Input
                value={content.then_year || ""}
                onChange={(e) => updateField("then_year", e.target.value)}
                placeholder="Year (e.g., 1994)"
              />
            </div>
            <div className="space-y-2">
              <Label>Current Image ("Now")</Label>
              <MediaUpload
                value={content.now_image}
                onChange={(url) => updateField("now_image", url)}
                mediaType="image"
                folder="stories"
              />
              <Input
                value={content.now_year || ""}
                onChange={(e) => updateField("now_year", e.target.value)}
                placeholder="Year (e.g., 2024)"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Caption</Label>
            <Input
              value={content.caption || ""}
              onChange={(e) => updateField("caption", e.target.value)}
              placeholder="Describe the transformation"
            />
          </div>
        </div>
      );

    case "linked_testimony":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Select Testimony</Label>
            <Select
              value={content.testimony_id || ""}
              onValueChange={(value) => updateField("testimony_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a testimony to link" />
              </SelectTrigger>
              <SelectContent>
                {testimonies.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.person_name} - {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Context Note (optional)</Label>
            <Textarea
              value={content.context || ""}
              onChange={(e) => updateField("context", e.target.value)}
              placeholder="Why is this testimony relevant here?"
              rows={2}
            />
          </div>
        </div>
      );

    case "linked_story":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Select Related Story</Label>
            <Select
              value={content.story_id || ""}
              onValueChange={(value) => updateField("story_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a story to link" />
              </SelectTrigger>
              <SelectContent>
                {stories
                  .filter((s) => s.status === "published")
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Relationship Note (optional)</Label>
            <Input
              value={content.relationship || ""}
              onChange={(e) => updateField("relationship", e.target.value)}
              placeholder="e.g., 'Continue reading...' or 'Related story'"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="text-muted-foreground text-sm">
          Unknown block type: {blockType}
        </div>
      );
  }
}
