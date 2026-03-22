import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Ticket,
  Lock,
  Sparkles,
  Building2,
  Clock,
} from "lucide-react";
import { TourGroupAccess } from "@/hooks/useContentAccess";

interface AccessLevelBannerProps {
  hasSubscription: boolean;
  tourGroupAccess: TourGroupAccess | null;
}

export function AccessLevelBanner({ hasSubscription, tourGroupAccess }: AccessLevelBannerProps) {
  // Full access (subscription)
  if (hasSubscription) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber/10 rounded-lg border border-amber/30">
        <Crown className="w-4 h-4 text-amber" />
        <span className="text-xs font-medium text-amber">Full Access</span>
        <Badge variant="outline" className="text-[10px] bg-amber/20 text-amber border-amber/50 ml-auto">
          Premium
        </Badge>
      </div>
    );
  }

  // Tour group access
  if (tourGroupAccess) {
    const isExpiringSoon = tourGroupAccess.expiresAt && 
      new Date(tourGroupAccess.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;

    return (
      <div className="px-3 py-2 bg-adventure-green/10 rounded-lg border border-adventure-green/30">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-adventure-green" />
          <span className="text-xs font-medium text-foreground">
            Access provided by {tourGroupAccess.agencyName}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] bg-adventure-green/20 text-adventure-green border-adventure-green/50">
              <Ticket className="w-3 h-3 mr-1" />
              {tourGroupAccess.accessLevel === "full" ? "Full Access" : "Route Access"}
            </Badge>
            {tourGroupAccess.expiresAt && (
              <span className={`text-[10px] flex items-center gap-1 ${isExpiringSoon ? 'text-destructive' : 'text-muted-foreground'}`}>
                <Clock className="w-3 h-3" />
                {isExpiringSoon ? 'Expires soon' : `Until ${new Date(tourGroupAccess.expiresAt).toLocaleDateString()}`}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Free tier
  return (
    <div className="px-3 py-2 bg-muted rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Free Tier — Limited responses
          </span>
        </div>
        <Button size="sm" variant="ghost" className="h-6 text-xs" asChild>
          <Link to="/access">
            <Sparkles className="w-3 h-3 mr-1" />
            Upgrade
          </Link>
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
        Unlock full AI capabilities with a subscription or tour code
      </p>
    </div>
  );
}

interface LockedContentTeaserProps {
  contentType: "testimony" | "route" | "story";
  title: string;
}

export function LockedContentTeaser({ contentType, title }: LockedContentTeaserProps) {
  const getIcon = () => {
    switch (contentType) {
      case "testimony":
        return <Lock className="w-4 h-4" />;
      case "route":
        return <Lock className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-3 bg-muted/50 rounded-lg border border-dashed border-border mt-3">
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="text-sm font-medium text-foreground">
          Unlock "{title}"
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        This {contentType} contains premium content. Upgrade to explore the full story.
      </p>
      <Button size="sm" variant="outline" className="w-full" asChild>
        <Link to="/access">
          <Sparkles className="w-3 h-3 mr-1" />
          Upgrade to Unlock
        </Link>
      </Button>
    </div>
  );
}
