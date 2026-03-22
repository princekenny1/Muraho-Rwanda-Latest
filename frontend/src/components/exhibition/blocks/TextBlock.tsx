import { cn } from "@/lib/utils";

interface TextBlockProps {
  content: string;
  isActive: boolean;
  onClick: () => void;
  fontSize: "small" | "medium" | "large";
}

const fontSizeClasses = {
  small: "text-sm leading-relaxed",
  medium: "text-base leading-relaxed",
  large: "text-lg leading-loose",
};

export function TextBlock({ content, isActive, onClick, fontSize }: TextBlockProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-amber/50",
        isActive
          ? "bg-card border-amber/30 shadow-lg transform -translate-y-1"
          : "bg-card/60 border-border/50 opacity-70 hover:opacity-90"
      )}
    >
      <p className={cn("text-foreground", fontSizeClasses[fontSize])}>
        {content}
      </p>
    </button>
  );
}
