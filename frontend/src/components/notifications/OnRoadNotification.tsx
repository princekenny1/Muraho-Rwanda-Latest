import { useState, useEffect } from "react";
import { Play, Eye, Clock, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnRoadNotificationProps {
  story: {
    id: string;
    title: string;
    duration: string;
    teaser: string;
    hasThenNow: boolean;
    theme: string;
    themeColor: string;
  };
  isVisible: boolean;
  onPlayNow: (storyId: string) => void;
  onPreview: (storyId: string) => void;
  onSnooze: (storyId: string, option: "10min" | "endOfRoute" | "save") => void;
  onDismiss: () => void;
  autoDismissDelay?: number;
}

export function OnRoadNotification({
  story,
  isVisible,
  onPlayNow,
  onPreview,
  onSnooze,
  onDismiss,
  autoDismissDelay = 10000,
}: OnRoadNotificationProps) {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      setShowSnoozeOptions(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (autoDismissDelay / 100));
        if (newProgress <= 0) {
          onDismiss();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, autoDismissDelay, onDismiss]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-24 left-4 right-4 z-50",
        "animate-slide-up"
      )}
    >
      <div 
        className="bg-white rounded-2xl shadow-modal overflow-hidden"
        style={{ boxShadow: '0 12px 40px rgba(10, 26, 47, 0.2)' }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-amber transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-adventure-green font-semibold mb-1">
                Up ahead
              </p>
              <h3 className="font-semibold text-foreground text-base">
                {story.title}
              </h3>
            </div>
            <button
              onClick={onDismiss}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors -mr-1 -mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Teaser */}
          <p className="text-sm text-muted-foreground mt-2">
            {story.teaser}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {story.duration}
            </span>
            {story.hasThenNow && (
              <span className="flex items-center gap-1 text-xs text-amber font-medium">
                <Image className="w-3 h-3" />
                Then & Now
              </span>
            )}
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${story.themeColor}15`,
                color: story.themeColor 
              }}
            >
              {story.theme}
            </span>
          </div>

          {/* Snooze options */}
          {showSnoozeOptions ? (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  onSnooze(story.id, "10min");
                  setShowSnoozeOptions(false);
                }}
                className="flex-1 h-9 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                10 min
              </button>
              <button
                onClick={() => {
                  onSnooze(story.id, "endOfRoute");
                  setShowSnoozeOptions(false);
                }}
                className="flex-1 h-9 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                End of Route
              </button>
              <button
                onClick={() => {
                  onSnooze(story.id, "save");
                  setShowSnoozeOptions(false);
                }}
                className="flex-1 h-9 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onPlayNow(story.id)}
                className="flex-1 h-10 bg-amber text-midnight rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-sunset-gold transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Now
              </button>
              <button
                onClick={() => onPreview(story.id)}
                className="h-10 px-4 border-2 border-midnight rounded-xl font-medium text-midnight hover:bg-midnight/5 transition-colors flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setShowSnoozeOptions(true)}
                className="h-10 px-3 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Snooze
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
