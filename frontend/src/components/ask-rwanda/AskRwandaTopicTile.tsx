import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AskRwandaTopicTileProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "default" | "museum" | "route" | "theme" | "testimony";
}

const variantStyles = {
  default: "bg-card hover:bg-card/80 border-border/50",
  museum: "bg-forest-teal/10 hover:bg-forest-teal/15 border-forest-teal/30",
  route: "bg-adventure-green/10 hover:bg-adventure-green/15 border-adventure-green/30",
  theme: "bg-terracotta/10 hover:bg-terracotta/15 border-terracotta/30",
  testimony: "bg-muted-indigo/10 hover:bg-muted-indigo/15 border-muted-indigo/30",
};

const iconStyles = {
  default: "text-amber",
  museum: "text-forest-teal",
  route: "text-adventure-green",
  theme: "text-terracotta",
  testimony: "text-muted-indigo",
};

export function AskRwandaTopicTile({
  icon: Icon,
  title,
  description,
  onClick,
  variant = "default",
}: AskRwandaTopicTileProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border transition-all duration-200 text-left group",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            variant === "default" ? "bg-amber/10" : "bg-white/50"
          )}
        >
          <Icon className={cn("w-5 h-5", iconStyles[variant])} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground group-hover:text-amber transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
