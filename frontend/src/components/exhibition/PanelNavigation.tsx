import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PanelNavigationProps {
  currentPanel: number;
  totalPanels: number;
  onPrevious: () => void;
  onNext: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

export function PanelNavigation({
  currentPanel,
  totalPanels,
  onPrevious,
  onNext,
  prevTitle,
  nextTitle,
}: PanelNavigationProps) {
  const hasPrevious = currentPanel > 1;
  const hasNext = currentPanel < totalPanels;

  return (
    <div className="flex items-stretch gap-3">
      {/* Previous */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={cn(
          "flex-1 h-auto py-3 px-4 flex items-center gap-2 justify-start",
          !hasPrevious && "opacity-50"
        )}
      >
        <ChevronLeft className="w-5 h-5 flex-shrink-0" />
        <div className="text-left min-w-0">
          <p className="text-xs text-muted-foreground">Previous</p>
          {prevTitle && (
            <p className="text-sm font-medium truncate">{prevTitle}</p>
          )}
        </div>
      </Button>

      {/* Next */}
      <Button
        variant="default"
        onClick={onNext}
        disabled={!hasNext}
        className={cn(
          "flex-1 h-auto py-3 px-4 flex items-center gap-2 justify-end bg-amber hover:bg-amber/90 text-midnight",
          !hasNext && "opacity-50"
        )}
      >
        <div className="text-right min-w-0">
          <p className="text-xs text-midnight/70">Next</p>
          {nextTitle && (
            <p className="text-sm font-medium truncate">{nextTitle}</p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 flex-shrink-0" />
      </Button>
    </div>
  );
}
