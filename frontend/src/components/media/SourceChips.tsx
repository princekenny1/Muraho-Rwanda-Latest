import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Source {
  id: string;
  label: string;
  url?: string;
  type?: "museum" | "institution" | "archive" | "default";
}

interface SourceChipsProps {
  sources: Source[];
  onSourceClick?: (source: Source) => void;
  className?: string;
}

const typeStyles = {
  museum: "bg-forest-teal text-white hover:bg-forest-teal/90",
  institution: "bg-accent-violet text-white hover:bg-accent-violet/90",
  archive: "bg-muted-indigo text-white hover:bg-muted-indigo/90",
  default: "bg-midnight/10 text-foreground hover:bg-midnight/20",
};

export function SourceChips({
  sources,
  onSourceClick,
  className,
}: SourceChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {sources.map((source) => {
        const style = typeStyles[source.type || "default"];
        
        if (source.url) {
          return (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (onSourceClick) {
                  e.preventDefault();
                  onSourceClick(source);
                }
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                style
              )}
            >
              {source.label}
              <ExternalLink className="w-3 h-3" />
            </a>
          );
        }

        return (
          <button
            key={source.id}
            onClick={() => onSourceClick?.(source)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
              style
            )}
          >
            {source.label}
          </button>
        );
      })}
    </div>
  );
}
