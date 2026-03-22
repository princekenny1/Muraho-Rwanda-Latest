import { useState, useRef } from "react";
import { Upload, X, Loader2, Image, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";

type MediaType = "image" | "video" | "audio";

interface MediaUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  mediaType: MediaType;
  folder?: string;
  className?: string;
}

const mediaConfig: Record<MediaType, { accept: string; maxSize: number; icon: any; label: string }> = {
  image: { accept: "image/*", maxSize: 5 * 1024 * 1024, icon: Image, label: "image" },
  video: { accept: "video/*", maxSize: 100 * 1024 * 1024, icon: Video, label: "video" },
  audio: { accept: "audio/*", maxSize: 50 * 1024 * 1024, icon: Music, label: "audio" },
};

export function MediaUpload({ 
  value, 
  onChange, 
  mediaType,
  folder = "media",
  className = ""
}: MediaUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = mediaConfig[mediaType];
  const Icon = config.icon;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > config.maxSize) {
      const maxMB = config.maxSize / (1024 * 1024);
      toast({ title: "File too large", description: `${config.label} must be under ${maxMB}MB`, variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await api.uploadMedia(file);
      onChange(result.url);
      toast({ title: `${config.label.charAt(0).toUpperCase() + config.label.slice(1)} uploaded` });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const renderPreview = () => {
    if (!value) return null;

    if (mediaType === "image") {
      return (
        <img src={value} alt="Uploaded" className="w-full h-32 object-cover rounded" />
      );
    }

    if (mediaType === "video") {
      return (
        <video src={value} controls className="w-full h-32 object-cover rounded" />
      );
    }

    if (mediaType === "audio") {
      return (
        <audio src={value} controls className="w-full" />
      );
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        <div className="space-y-2">
          {renderPreview()}
          <div className="flex gap-2">
            <Button 
              type="button"
              size="sm" 
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Replace
            </Button>
            <Button 
              type="button"
              size="sm" 
              variant="destructive"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Icon className="h-6 w-6" />
              <span className="text-sm">Upload {config.label}</span>
              <span className="text-xs">Max {config.maxSize / (1024 * 1024)}MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
