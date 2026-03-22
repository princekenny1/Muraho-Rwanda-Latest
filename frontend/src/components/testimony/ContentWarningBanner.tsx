import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ContentWarningBannerProps {
  warningText?: string;
  onDismiss?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function ContentWarningBanner({
  warningText = "This testimony contains descriptions of violence and loss that may be distressing.",
  onDismiss,
  onSkip,
  className,
}: ContentWarningBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={cn(
        "bg-muted-indigo/15 border border-muted-indigo/30 rounded-xl p-4 animate-fade-in",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-muted-indigo/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-muted-indigo" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm mb-1">
            Content Warning
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {warningText}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-foreground hover:bg-muted-indigo/10"
            >
              I understand, continue
            </Button>
            {onSkip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip this testimony
              </Button>
            )}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-muted-indigo/10 rounded-lg transition-colors"
          aria-label="Dismiss warning"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
