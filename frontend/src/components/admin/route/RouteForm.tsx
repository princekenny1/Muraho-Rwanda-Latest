import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ImageUpload } from "./ImageUpload";

interface RouteFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; slug: string; description?: string; cover_image?: string }) => void;
  initialData?: {
    title: string;
    slug: string;
    description?: string;
    cover_image?: string;
  };
}

export function RouteForm({ open, onClose, onSubmit, initialData }: RouteFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!initialData) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    setIsSubmitting(true);
    await onSubmit({ 
      title, 
      slug, 
      description: description || undefined,
      cover_image: coverImage || undefined 
    });
    setIsSubmitting(false);
    
    // Reset form
    setTitle("");
    setSlug("");
    setDescription("");
    setCoverImage("");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{initialData ? "Edit Route" : "Create New Route"}</SheetTitle>
          <SheetDescription>
            {initialData 
              ? "Update route details"
              : "Start by adding basic route information. You can add stops and content after creating the route."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Route Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., Kigali City Day Tour"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., kigali-city-day-tour"
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be used in the URL: /routes/{slug || "your-slug"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this route..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <ImageUpload
              value={coverImage}
              onChange={(url) => setCoverImage(url || "")}
              folder="covers"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !slug.trim()} className="flex-1">
              {isSubmitting ? "Creating..." : initialData ? "Save Changes" : "Create Route"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
