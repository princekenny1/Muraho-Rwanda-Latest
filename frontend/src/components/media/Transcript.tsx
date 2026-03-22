import { useState, useEffect, useRef } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptProps {
  segments?: TranscriptSegment[];
  currentTime?: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  onSeek?: (time: number) => void;
  className?: string;
}

const defaultSegments: TranscriptSegment[] = [
  { id: "1", startTime: 0, endTime: 15, text: "The Kigali Genocide Memorial stands as a powerful testament to Rwanda's commitment to remembrance and reconciliation." },
  { id: "2", startTime: 15, endTime: 30, text: "As you walk through the memorial gardens, you'll encounter the Wall of Names, inscribed with the names of victims whose identities have been recovered." },
  { id: "3", startTime: 30, endTime: 45, text: "The gardens serve as a space for quiet reflection, where visitors can honor the memory of those lost." },
  { id: "4", startTime: 45, endTime: 60, text: "Each rose bush represents a life, creating a living tribute that grows and blooms with time." },
  { id: "5", startTime: 60, endTime: 75, text: "The memorial educates visitors about the events leading up to the genocide, the hundred days of violence, and the remarkable journey of reconciliation that followed." },
];

export function Transcript({
  segments = defaultSegments,
  currentTime = 0,
  isExpanded = false,
  onToggle,
  onSeek,
  className,
}: TranscriptProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const activeRef = useRef<HTMLDivElement>(null);

  const activeSegmentId = segments.find(
    (s) => currentTime >= s.startTime && currentTime < s.endTime
  )?.id;

  useEffect(() => {
    if (activeRef.current && expanded) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeSegmentId, expanded]);

  const handleToggle = () => {
    setExpanded(!expanded);
    onToggle?.();
  };

  return (
    <div className={cn("bg-midnight/5 rounded-xl overflow-hidden", className)}>
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-midnight/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">
            {expanded ? "Hide transcript" : "Show transcript"}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 max-h-64 overflow-y-auto animate-fade-up">
          <div className="space-y-3">
            {segments.map((segment) => {
              const isActive = segment.id === activeSegmentId;
              return (
                <div
                  key={segment.id}
                  ref={isActive ? activeRef : null}
                  onClick={() => onSeek?.(segment.startTime)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all duration-300",
                    isActive
                      ? "bg-amber/10 border-l-2 border-amber"
                      : "hover:bg-midnight/5"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm leading-relaxed transition-colors",
                      isActive ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {segment.text}
                  </p>
                  <span className="text-xs text-muted-foreground/60 mt-1 block">
                    {Math.floor(segment.startTime / 60)}:
                    {(segment.startTime % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
