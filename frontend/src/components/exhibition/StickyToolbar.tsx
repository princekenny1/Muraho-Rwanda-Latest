import { BookOpen, Bookmark, Share2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface StickyToolbarProps {
  onSourcesClick: () => void;
  onSaveClick: () => void;
  onShareClick: () => void;
  onFontSizeChange: (size: "small" | "medium" | "large") => void;
  currentFontSize: "small" | "medium" | "large";
  isSaved: boolean;
}

export function StickyToolbar({
  onSourcesClick,
  onSaveClick,
  onShareClick,
  onFontSizeChange,
  currentFontSize,
  isSaved,
}: StickyToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-pb">
      <div className="flex items-center justify-around py-3 px-4">
        {/* Sources */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSourcesClick}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-xs">Sources</span>
        </Button>

        {/* Save */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSaveClick}
          className={cn(
            "flex flex-col items-center gap-1 h-auto py-2",
            isSaved && "text-amber"
          )}
        >
          <Bookmark className={cn("w-5 h-5", isSaved && "fill-amber")} />
          <span className="text-xs">{isSaved ? "Saved" : "Save"}</span>
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShareClick}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-xs">Share</span>
        </Button>

        {/* Font Size */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <Type className="w-5 h-5" />
              <span className="text-xs">Text</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-background border-border z-[60]">
            <DropdownMenuItem
              onClick={() => onFontSizeChange("small")}
              className={cn(currentFontSize === "small" && "bg-muted")}
            >
              <span className="text-sm">Small</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFontSizeChange("medium")}
              className={cn(currentFontSize === "medium" && "bg-muted")}
            >
              <span className="text-base">Medium</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFontSizeChange("large")}
              className={cn(currentFontSize === "large" && "bg-muted")}
            >
              <span className="text-lg">Large</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
