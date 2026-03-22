import { Bookmark, ListPlus, Download, Share2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DownloadableAsset {
  id: string;
  name: string;
  type: "transcript" | "photos" | "study-guide";
  size?: string;
}

interface DocumentaryActionsProps {
  isSaved?: boolean;
  downloadableAssets?: DownloadableAsset[];
  onSave?: () => void;
  onAddToPlaylist?: () => void;
  onShare?: () => void;
  onDownload?: (asset: DownloadableAsset) => void;
  className?: string;
}

export function DocumentaryActions({
  isSaved = false,
  downloadableAssets = [],
  onSave,
  onAddToPlaylist,
  onShare,
  onDownload,
  className,
}: DocumentaryActionsProps) {
  const [saved, setSaved] = useState(isSaved);
  const [showDownloads, setShowDownloads] = useState(false);

  const handleSave = () => {
    setSaved(!saved);
    onSave?.();
    toast.success(saved ? "Removed from saved" : "Documentary saved");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this documentary",
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
    onShare?.();
  };

  const handleAddToPlaylist = () => {
    onAddToPlaylist?.();
    toast.success("Added to playlist");
  };

  return (
    <div className={cn("space-y-4 p-4", className)}>
      {/* Primary Actions */}
      <div className="flex gap-2">
        <Button
          variant={saved ? "default" : "outline"}
          className={cn(
            "flex-1",
            saved && "bg-amber hover:bg-amber/90 text-midnight"
          )}
          onClick={handleSave}
        >
          {saved ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Bookmark className="w-4 h-4 mr-2" />
          )}
          {saved ? "Saved" : "Save"}
        </Button>

        <Button
          variant="outline"
          className="flex-1"
          onClick={handleAddToPlaylist}
        >
          <ListPlus className="w-4 h-4 mr-2" />
          Add to Playlist
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Downloads Section */}
      {downloadableAssets.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowDownloads(!showDownloads)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Downloadable Assets ({downloadableAssets.length})
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {showDownloads ? "Hide" : "Show"}
            </span>
          </button>

          {showDownloads && (
            <div className="border-t border-border divide-y divide-border">
              {downloadableAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => {
                    onDownload?.(asset);
                    toast.success(`Downloading ${asset.name}...`);
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {asset.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {asset.type.replace("-", " ")}
                      {asset.size && ` • ${asset.size}`}
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-amber" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
