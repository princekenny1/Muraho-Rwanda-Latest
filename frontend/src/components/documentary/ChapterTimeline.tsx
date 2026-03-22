import { Video, Archive, MapPin, User, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export type ChapterType = "interview" | "archival" | "map" | "narrative" | "documentary";

export interface Chapter {
  id: string;
  title: string;
  duration: number; // in seconds
  type: ChapterType;
  isCompleted?: boolean;
}

interface ChapterTimelineProps {
  chapters: Chapter[];
  currentChapterId?: string;
  onChapterSelect: (chapterId: string) => void;
  className?: string;
}

const typeConfig: Record<ChapterType, { icon: typeof Video; color: string; label: string }> = {
  interview: { icon: User, color: "bg-accent-violet", label: "Interview" },
  archival: { icon: Archive, color: "bg-muted-indigo", label: "Archival" },
  map: { icon: MapPin, color: "bg-forest-teal", label: "Map" },
  narrative: { icon: Video, color: "bg-amber", label: "Narrative" },
  documentary: { icon: Video, color: "bg-muted-indigo/80", label: "Documentary" },
};

export function ChapterTimeline({
  chapters,
  currentChapterId,
  onChapterSelect,
  className,
}: ChapterTimelineProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className={cn("py-4", className)}>
      <h3 className="text-sm font-semibold text-foreground px-4 mb-3">
        Chapters
      </h3>
      
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-4 pb-2">
          {chapters.map((chapter, index) => {
            const config = typeConfig[chapter.type];
            const Icon = config.icon;
            const isCurrent = chapter.id === currentChapterId;
            const isCompleted = chapter.isCompleted;
            
            return (
              <button
                key={chapter.id}
                onClick={() => onChapterSelect(chapter.id)}
                className={cn(
                  "flex-shrink-0 w-36 p-3 rounded-xl transition-all duration-200",
                  "border-2",
                  isCurrent
                    ? "bg-amber/10 border-amber shadow-lg"
                    : isCompleted
                    ? "bg-muted/50 border-muted-foreground/20"
                    : "bg-card border-border hover:border-amber/50 hover:bg-amber/5"
                )}
              >
                {/* Chapter Number & Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-amber" : "text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                  
                  <div className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white",
                    config.color
                  )}>
                    <Icon className="w-2.5 h-2.5" />
                    {config.label}
                  </div>
                </div>
                
                {/* Title */}
                <p className={cn(
                  "text-xs font-medium text-left line-clamp-2 mb-2",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}>
                  {chapter.title}
                </p>
                
                {/* Duration & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDuration(chapter.duration)}
                  </span>
                  
                  {isCompleted && (
                    <div className="w-4 h-4 rounded-full bg-forest-teal flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
