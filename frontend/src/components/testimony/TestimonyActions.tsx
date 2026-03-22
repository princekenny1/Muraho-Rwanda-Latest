import { Bookmark, FolderPlus, Share2, FileText, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface Source {
  name: string;
  url?: string;
}

interface TestimonyActionsProps {
  testimonyId: string;
  testimonyTitle: string;
  sources?: Source[];
  isSaved?: boolean;
  onSave?: () => void;
  onAddToCollection?: () => void;
  className?: string;
}

export function TestimonyActions({
  testimonyId,
  testimonyTitle,
  sources = [],
  isSaved = false,
  onSave,
  onAddToCollection,
  className,
}: TestimonyActionsProps) {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = () => {
    setSaved(!saved);
    onSave?.();
    toast({
      title: saved ? "Removed from saved" : "Saved for later",
      description: saved ? "Testimony removed from your saved items" : "You can find this in your profile",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: testimonyTitle,
      text: `Listen to this testimony: ${testimonyTitle}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Testimony link copied to clipboard",
        });
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Save Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        className={cn(
          "gap-2",
          saved && "text-muted-indigo"
        )}
      >
        {saved ? (
          <Check className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
      </Button>

      {/* Add to Collection */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddToCollection}
        className="gap-2"
      >
        <FolderPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Add to Collection</span>
      </Button>

      {/* Share */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      {/* Sources Dropdown */}
      {sources.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Sources</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-popover z-50">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Source Materials
            </div>
            {sources.map((source, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => source.url && window.open(source.url, "_blank")}
                className="cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="truncate">{source.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
