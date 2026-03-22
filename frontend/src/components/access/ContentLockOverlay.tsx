import { useState } from "react";
import { Lock, Play, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccessCheckResult } from "@/hooks/useContentAccess";
import { AccessOptionsModal } from "./AccessOptionsModal";
import { SponsoredBanner } from "./SponsoredBanner";
import { cn } from "@/lib/utils";

interface ContentLockOverlayProps {
  accessResult: AccessCheckResult;
  contentTitle?: string;
  showPreview?: boolean;
  previewDuration?: number;
  onPreviewClick?: () => void;
  onAccessGranted?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function ContentLockOverlay({
  accessResult,
  contentTitle,
  showPreview = true,
  previewDuration,
  onPreviewClick,
  onAccessGranted,
  className,
  children,
}: ContentLockOverlayProps) {
  const [showModal, setShowModal] = useState(false);

  // If has access, just render children
  if (accessResult.hasAccess) {
    // Show sponsored banner if sponsored
    if (accessResult.reason === "sponsored" && accessResult.config?.sponsor) {
      return (
        <div className={className}>
          <SponsoredBanner
            sponsorName={accessResult.config.sponsor.name}
            sponsorLogo={accessResult.config.sponsor.logo_url}
            message={accessResult.config.sponsor_message}
            variant="banner"
            className="mb-4"
          />
          {children}
        </div>
      );
    }
    return <>{children}</>;
  }

  // Locked state
  return (
    <>
      <div className={cn("relative", className)}>
        {/* Blurred/teaser content background */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-sm z-10" />
        
        {/* Lock overlay content */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted-indigo/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-muted-indigo" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Premium Experience</h3>
          
          <p className="text-muted-foreground mb-6 max-w-sm">
            Full access includes all stories, testimonies, museum deep dives, audio guides, and offline routes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setShowModal(true)} className="min-w-[180px]">
              See Access Options
            </Button>
            
            {showPreview && previewDuration && onPreviewClick && (
              <Button variant="outline" onClick={onPreviewClick}>
                <Play className="w-4 h-4 mr-1" />
                Preview ({previewDuration}s)
              </Button>
            )}
          </div>

          {/* Quick access hints */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Subscribe for full access
            </span>
            <span>•</span>
            <span>Unlock just this story</span>
            <span>•</span>
            <span>Enter tour group code</span>
          </div>
        </div>
      </div>

      <AccessOptionsModal
        open={showModal}
        onOpenChange={setShowModal}
        config={accessResult.config}
        contentTitle={contentTitle}
        onAccessGranted={onAccessGranted}
      />
    </>
  );
}
