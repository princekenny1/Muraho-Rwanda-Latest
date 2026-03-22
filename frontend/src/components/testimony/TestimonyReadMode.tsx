import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";

interface TranscriptSegment {
  time: number; // seconds
  text: string;
  isPullQuote?: boolean;
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
}

interface TestimonyReadModeProps {
  segments: TranscriptSegment[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  className?: string;
}

export function TestimonyReadMode({
  segments,
  currentTime = 0,
  onSeek,
  className,
}: TestimonyReadModeProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getActiveSegmentIndex = () => {
    for (let i = segments.length - 1; i >= 0; i--) {
      if (currentTime >= segments[i].time) return i;
    }
    return 0;
  };

  const activeIndex = getActiveSegmentIndex();

  return (
    <div className={cn("space-y-6", className)}>
      {segments.map((segment, index) => {
        const isActive = index === activeIndex;
        const isPast = index < activeIndex;

        // Pull Quote
        if (segment.isPullQuote) {
          return (
            <blockquote
              key={index}
              onClick={() => onSeek?.(segment.time)}
              className={cn(
                "relative pl-6 py-4 border-l-4 border-muted-indigo/50 bg-muted-indigo/5 rounded-r-xl cursor-pointer transition-all duration-300",
                isActive && "border-muted-indigo bg-muted-indigo/10"
              )}
            >
              <Quote className="absolute -left-3 -top-2 w-6 h-6 text-muted-indigo/30" />
              <p className="text-lg font-serif text-foreground italic leading-relaxed">
                "{segment.text}"
              </p>
              <button
                className="mt-2 text-xs text-muted-foreground hover:text-muted-indigo transition-colors"
              >
                [{formatTime(segment.time)}]
              </button>
            </blockquote>
          );
        }

        // Inline Image
        if (segment.image) {
          return (
            <figure key={index} className="my-8">
              <img
                src={segment.image.src}
                alt={segment.image.alt}
                className="w-full rounded-xl object-cover max-h-80"
              />
              {segment.image.caption && (
                <figcaption className="mt-2 text-sm text-muted-foreground text-center">
                  {segment.image.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // Regular Text Segment
        return (
          <div
            key={index}
            onClick={() => onSeek?.(segment.time)}
            className={cn(
              "group cursor-pointer transition-all duration-300 rounded-lg p-3 -mx-3",
              isActive && "bg-soft-lavender/10",
              !isActive && !isPast && "hover:bg-muted/50"
            )}
          >
            <div className="flex gap-4">
              {/* Time Marker */}
              <button
                className={cn(
                  "text-xs font-mono transition-colors flex-shrink-0 pt-1",
                  isActive
                    ? "text-muted-indigo font-medium"
                    : "text-muted-foreground group-hover:text-muted-indigo"
                )}
              >
                [{formatTime(segment.time)}]
              </button>

              {/* Text */}
              <p
                className={cn(
                  "text-base leading-relaxed transition-colors",
                  isActive
                    ? "text-foreground"
                    : isPast
                    ? "text-muted-foreground"
                    : "text-foreground/80"
                )}
                style={{ maxWidth: "65ch" }}
              >
                {segment.text}
              </p>
            </div>

            {/* Active Indicator */}
            {isActive && (
              <div className="h-0.5 bg-muted-indigo/30 rounded-full mt-3 animate-fade-in" />
            )}
          </div>
        );
      })}
    </div>
  );
}
