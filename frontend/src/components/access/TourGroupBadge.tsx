import { Users, Clock, Check } from "lucide-react";
import { TourGroupAccess } from "@/hooks/useContentAccess";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TourGroupBadgeProps {
  access: TourGroupAccess;
  variant?: "compact" | "full";
  className?: string;
}

export function TourGroupBadge({ access, variant = "compact", className }: TourGroupBadgeProps) {
  const timeRemaining = formatDistanceToNow(access.expiresAt, { addSuffix: false });

  if (variant === "full") {
    return (
      <div className={cn(
        "bg-gradient-to-r from-forest-teal/10 to-adventure-green/10 border border-forest-teal/30 rounded-lg p-4",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-forest-teal/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-forest-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-adventure-green" />
              <p className="text-sm font-medium">Tour Group Access</p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Provided by: {access.agencyName}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeRemaining} remaining
              </span>
              <span className="capitalize">
                {access.accessLevel === "full" ? "Full Content" : access.accessLevel.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  return (
    <div className={cn(
      "flex items-center gap-2 text-xs bg-forest-teal/10 text-forest-teal px-2 py-1 rounded-full",
      className
    )}>
      <Users className="w-3 h-3" />
      <span>Access: {access.agencyName}</span>
    </div>
  );
}
