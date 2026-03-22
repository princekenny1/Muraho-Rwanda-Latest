import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuoteBlockProps {
  quote: string;
  attribution: string;
  year?: string;
  isActive: boolean;
  onClick: () => void;
  fontSize: "small" | "medium" | "large";
}

const fontSizeClasses = {
  small: "text-base",
  medium: "text-lg",
  large: "text-xl",
};

export function QuoteBlock({ quote, attribution, year, isActive, onClick, fontSize }: QuoteBlockProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 rounded-2xl border transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-amber/50",
        isActive
          ? "bg-muted-indigo/10 border-muted-indigo/30 shadow-lg transform -translate-y-1"
          : "bg-muted-indigo/5 border-border/50 opacity-70 hover:opacity-90"
      )}
    >
      <Quote className="w-6 h-6 text-muted-indigo mb-3" />
      <blockquote className={cn(
        "font-serif italic text-foreground mb-3 leading-relaxed",
        fontSizeClasses[fontSize]
      )}>
        "{quote}"
      </blockquote>
      <footer className="text-sm text-muted-foreground">
        — {attribution}
        {year && <span className="text-muted-foreground/70">, {year}</span>}
      </footer>
    </button>
  );
}
