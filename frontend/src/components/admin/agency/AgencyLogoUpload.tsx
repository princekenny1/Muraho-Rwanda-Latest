import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadAgencyLogo } from "@/hooks/useAgency";
import { useToast } from "@/hooks/use-toast";

interface AgencyLogoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function AgencyLogoUpload({ value, onChange, disabled }: AgencyLogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Logo must be under 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload to Payload Media collection
      const publicUrl = await uploadAgencyLogo(file);

      onChange(publicUrl);
      setPreview(publicUrl);

      toast({
        title: "Logo Uploaded",
        description: "Your agency logo has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      setPreview(value || null);
      toast({
        title: "Upload Failed",
        description: error.message || "Could not upload logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />

      {preview ? (
        <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden group">
          <img
            src={preview}
            alt="Agency logo preview"
            className="w-full h-full object-contain bg-muted/50"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className={cn(
            "w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25",
            "flex flex-col items-center justify-center gap-1",
            "text-muted-foreground hover:border-primary/50 hover:text-primary",
            "transition-colors cursor-pointer",
            (disabled || uploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-6 w-6" />
              <span className="text-xs">Add Logo</span>
            </>
          )}
        </button>
      )}

      <p className="text-xs text-muted-foreground">
        PNG, JPG up to 2MB
      </p>
    </div>
  );
}
