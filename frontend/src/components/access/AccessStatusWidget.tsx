import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContentAccess, TourGroupAccess } from "@/hooks/useContentAccess";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Ticket, Gift, Lock, ChevronRight, Clock, Building2, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type AccessLevel = "free" | "premium" | "tour_code" | "sponsored";

interface AccessStatusWidgetProps {
  variant?: "compact" | "full";
}

export function AccessStatusWidget({ variant = "compact" }: AccessStatusWidgetProps) {
  const { user } = useAuth();
  const { hasSubscription, tourGroupAccess, loading } = useContentAccess();

  const getAccessLevel = (): { level: AccessLevel; label: string; agency?: TourGroupAccess } => {
    if (hasSubscription) {
      return { level: "premium", label: "Full Access" };
    }
    if (tourGroupAccess) {
      return { level: "tour_code", label: "Tour Group Access", agency: tourGroupAccess };
    }
    return { level: "free", label: "Free Tier" };
  };

  const { level, label, agency } = getAccessLevel();

  const accessConfig = {
    free: {
      icon: Lock,
      gradient: "from-muted/30 to-muted/10",
      badge: "bg-muted text-muted-foreground",
      message: "Unlock full experiences for more content.",
    },
    premium: {
      icon: Crown,
      gradient: "from-amber/20 to-sunset-gold/10",
      badge: "bg-amber/20 text-amber border-amber/50",
      message: "You have unlimited access to all content.",
    },
    tour_code: {
      icon: Ticket,
      gradient: "from-adventure-green/20 to-forest-teal/10",
      badge: "bg-adventure-green/20 text-adventure-green border-adventure-green/50",
      message: agency ? `Provided by ${agency.agencyName}` : "Tour access active",
    },
    sponsored: {
      icon: Gift,
      gradient: "from-muted-indigo/20 to-primary/10",
      badge: "bg-muted-indigo/20 text-muted-indigo border-muted-indigo/50",
      message: "Enjoy sponsored content.",
    },
  };

  const config = accessConfig[level];
  const Icon = config.icon;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-16 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={`bg-gradient-to-r ${config.gradient} border-border/50`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-foreground/70" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Your Access:</span>
                  <Badge variant="outline" className={config.badge}>
                    {label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {config.message}
                </p>
              </div>
            </div>
            {level === "free" && user && (
              <Button asChild size="sm" variant="default">
                <Link to="/access">Upgrade</Link>
              </Button>
            )}
            {level === "free" && !user && (
              <Button asChild size="sm" variant="outline">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            {level === "tour_code" && agency && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(agency.expiresAt, { addSuffix: true })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={`bg-gradient-to-br ${config.gradient} border-border/50`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-background/50 flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7 text-foreground/70" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">Your Access:</span>
              <Badge variant="outline" className={config.badge}>
                {label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {config.message}
            </p>

            {level === "tour_code" && agency && (
              <div className="p-4 rounded-lg bg-background/50 mb-4 border border-adventure-green/20">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-adventure-green" />
                  <p className="text-xs text-muted-foreground">Provided by</p>
                </div>
                <p className="font-semibold text-foreground">{agency.agencyName}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Clock className="w-3 h-3" />
                  Valid {formatDistanceToNow(agency.expiresAt, { addSuffix: true })}
                </div>
                {agency.accessLevel === "full" && (
                  <p className="text-xs text-adventure-green mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Full access to all premium content
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {level === "free" && (
                <>
                  <Button asChild size="sm">
                    <Link to="/access">
                      <Crown className="w-4 h-4 mr-1" />
                      Upgrade
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/">
                      Explore Free Content
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </>
              )}
              {level === "premium" && (
                <Button asChild size="sm" variant="outline">
                  <Link to="/">
                    Start Exploring
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              )}
              {level === "tour_code" && (
                <Button asChild size="sm" variant="outline">
                  <Link to="/">
                    Start Your Journey
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
