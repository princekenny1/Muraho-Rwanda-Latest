import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentTierBadge } from "./ContentTierBadge";
import { AccessOptionsModal } from "./AccessOptionsModal";
import { AccessCheckResult } from "@/hooks/useContentAccess";
import { cn } from "@/lib/utils";

interface LockedCardOverlayProps {
  accessResult: AccessCheckResult;
  contentTitle?: string;
  teaser?: string;
  className?: string;
}

export function LockedCardOverlay({
  accessResult,
  contentTitle,
  teaser,
  className,
}: LockedCardOverlayProps) {
  const [showModal, setShowModal] = useState(false);

  if (accessResult.hasAccess) {
    return null;
  }

  return (
    <>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/60 to-transparent z-10 flex flex-col justify-end p-4",
        className
      )}>
        <div className="space-y-2">
          <ContentTierBadge 
            tier={accessResult.tier} 
            sponsorName={accessResult.config?.sponsor?.name}
            size="sm"
          />
          
          {teaser && (
            <p className="text-xs text-white/80 line-clamp-2">{teaser}</p>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowModal(true);
            }}
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Lock className="w-3 h-3 mr-1" />
            See Access Options
          </Button>
        </div>
      </div>

      <AccessOptionsModal
        open={showModal}
        onOpenChange={setShowModal}
        config={accessResult.config}
        contentTitle={contentTitle}
      />
    </>
  );
}
