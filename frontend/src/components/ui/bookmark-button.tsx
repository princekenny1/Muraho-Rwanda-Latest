import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersonalDashboard, ContentType } from "@/hooks/usePersonalDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BookmarkButtonProps {
  contentId: string;
  contentType: ContentType;
  title: string;
  imageUrl?: string;
  className?: string;
  variant?: "filled" | "overlay";
}

export function BookmarkButton({
  contentId,
  contentType,
  title,
  imageUrl,
  className,
  variant = "overlay",
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const { savedItems, saveItem, removeSavedItem, isSaving } = usePersonalDashboard();
  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  const isSaved = savedItems.some(
    (item) => item.content_id === contentId && item.content_type === contentType
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to your collection.",
        variant: "destructive",
      });
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (isSaved) {
      removeSavedItem({ content_id: contentId, content_type: contentType });
      toast({
        title: "Removed from saved",
        description: `"${title}" has been removed from your collection.`,
      });
    } else {
      saveItem({
        content_id: contentId,
        content_type: contentType,
        title,
        image_url: imageUrl,
      });
      toast({
        title: "Saved!",
        description: `"${title}" has been added to your collection.`,
      });
    }
  };

  if (variant === "overlay") {
    return (
      <button
        onClick={handleClick}
        disabled={isSaving}
        className={cn(
          "p-2 rounded-full backdrop-blur-sm transition-all duration-200",
          isSaved
            ? "bg-amber/90 text-midnight hover:bg-amber"
            : "bg-background/40 text-foreground hover:bg-background/60",
          isAnimating && "scale-125",
          className
        )}
        aria-label={isSaved ? "Remove from saved" : "Save to collection"}
      >
        <Bookmark
          className={cn(
            "w-4 h-4 transition-all",
            isSaved && "fill-current"
          )}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isSaving}
      className={cn(
        "p-1.5 rounded-lg transition-all duration-200",
        isSaved
          ? "text-amber hover:text-sunset-gold"
          : "text-muted-foreground hover:text-foreground",
        isAnimating && "scale-125",
        className
      )}
      aria-label={isSaved ? "Remove from saved" : "Save to collection"}
    >
      <Bookmark
        className={cn(
          "w-4 h-4 transition-all",
          isSaved && "fill-current"
        )}
      />
    </button>
  );
}
