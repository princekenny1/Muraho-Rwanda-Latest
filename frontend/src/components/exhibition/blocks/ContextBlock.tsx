import { Info, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextBlockProps {
  title: string;
  content: string;
  learnMoreUrl?: string;
  isActive: boolean;
  onClick: () => void;
  fontSize: "small" | "medium" | "large";
}

const fontSizeClasses = {
  small: "text-xs",
  medium: "text-sm",
  large: "text-base",
};

export function ContextBlock({
  title,
  content,
  learnMoreUrl,
  isActive,
  onClick,
  fontSize,
}: ContextBlockProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-amber/50",
        isActive
          ? "bg-amber/10 border-amber/30 shadow-lg transform -translate-y-1"
          : "bg-amber/5 border-border/50 opacity-70 hover:opacity-90"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-amber/20 flex items-center justify-center">
          <Info className="w-3.5 h-3.5 text-amber" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          {title}
        </span>
      </div>

      {/* Content */}
      <p className={cn("text-muted-foreground leading-relaxed", fontSizeClasses[fontSize])}>
        {content}
      </p>

      {/* Learn More Link */}
      {learnMoreUrl && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            window.open(learnMoreUrl, "_blank");
          }}
          className="flex items-center gap-1 mt-3 text-amber text-sm font-medium hover:text-amber/80 transition-colors"
        >
          Learn more
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      )}
    </button>
  );
}
