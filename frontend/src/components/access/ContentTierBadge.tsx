import { Lock, Sparkles } from "lucide-react";
import { ContentTier } from "@/hooks/useContentAccess";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ContentTierBadgeProps {
  tier: ContentTier;
  sponsorName?: string;
  className?: string;
  size?: "sm" | "default";
}

export function ContentTierBadge({ tier, sponsorName, className, size = "default" }: ContentTierBadgeProps) {
  if (tier === "free") {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-adventure-green/20 text-adventure-green border-adventure-green/50",
          size === "sm" && "text-xs py-0 px-1.5",
          className
        )}
      >
        Free
      </Badge>
    );
  }

  if (tier === "sponsored") {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-amber/20 text-amber border-amber/50",
          size === "sm" && "text-xs py-0 px-1.5",
          className
        )}
      >
        <Sparkles className={cn("mr-1", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
        Free — Sponsored{sponsorName ? ` by ${sponsorName}` : ""}
      </Badge>
    );
  }

  // Premium
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-muted-indigo/20 text-muted-indigo border-muted-indigo/50",
        size === "sm" && "text-xs py-0 px-1.5",
        className
      )}
    >
      <Lock className={cn("mr-1", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      Premium
    </Badge>
  );
}
