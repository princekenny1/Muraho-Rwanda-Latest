import { useState, useRef } from "react";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, Image, Video, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  mediaType?: "image" | "video" | "audio";
  folder?: string;
  accept?: string;
  placeholder?: string;
  disabled?: boolean;
}

const defaultAccept: Record<string, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  video: "video/mp4,video/webm,video/quicktime",
  audio: "audio/mpeg,audio/wav,audio/ogg,audio/aac",
};

const mediaIcons: Record<string, typeof Image> = {
  image: Image,
  video: Video,
  audio: Music,
};

export function MediaUpload({
  value,
  onChange,
  mediaType = "image",
  folder = "uploads",
  accept,
  placeholder,
  disabled = false,
}: MediaUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const Icon = mediaIcons[mediaType] || Image;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await api.uploadMedia(file);
      onChange(result.url || result.filename || null);
      toast({
        title: "Upload complete",
        description: `${file.name} uploaded successfully.`,
      });
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Upload failed",
        description:
          err instanceof Error
            ? err.message
            : "Could not upload the selected file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setUrlMode(false);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  if (value) {
    return (
      <div className="relative group rounded-lg border border-border overflow-hidden">
        {mediaType === "image" ? (
          <img
            src={value}
            alt="Uploaded media"
            className="w-full h-32 object-cover"
          />
        ) : mediaType === "video" ? (
          <video src={value} className="w-full h-32 object-cover" />
        ) : (
          <div className="w-full h-20 flex items-center justify-center bg-muted">
            <Music className="h-8 w-8 text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground truncate max-w-[200px]">
              {value.split("/").pop()}
            </span>
          </div>
        )}
        {!disabled && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (urlMode) {
    return (
      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={`Paste ${mediaType} URL...`}
          onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
        />
        <Button size="sm" onClick={handleUrlSubmit}>
          Set
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setUrlMode(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
      <input
        ref={fileRef}
        type="file"
        accept={accept || defaultAccept[mediaType]}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {uploading ? (
        <div className="flex items-center justify-center gap-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Uploading...</span>
        </div>
      ) : (
        <div className="space-y-2">
          <Icon className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {placeholder || `Upload ${mediaType}`}
          </p>
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
            >
              <Upload className="h-3 w-3 mr-1" />
              Choose File
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setUrlMode(true)}
              disabled={disabled}
            >
              Paste URL
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
