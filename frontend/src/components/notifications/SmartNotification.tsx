import { useState, useEffect, useCallback } from "react";
import { Play, Eye, Clock, Image, X, Volume2, Zap, Cloud, Moon, Sun, Pause, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationContext = "driving" | "walking" | "stationary";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type WeatherCondition = "clear" | "rain" | "fog" | "cloudy";

interface SmartNotificationProps {
  story: {
    id: string;
    title: string;
    duration: string;
    teaser: string;
    hasThenNow: boolean;
    theme: string;
    themeColor: string;
    emotionalTone?: "intense" | "inspiring" | "historical" | "peaceful";
    hasVideo?: boolean;
    hasAudio?: boolean;
  };
  isVisible: boolean;
  context?: NotificationContext;
  timeOfDay?: TimeOfDay;
  weather?: WeatherCondition;
  distanceAway?: string;
  upcomingCount?: number; // For bundling
  onPlayNow: (storyId: string) => void;
  onPreview: (storyId: string) => void;
  onSnooze: (storyId: string, option: "10min" | "endOfRoute" | "save") => void;
  onDismiss: () => void;
  onShowBundle?: () => void; // Show bundled stories
  autoDismissDelay?: number;
}

const contextTeasers: Record<NotificationContext, string> = {
  driving: "Quick listen ahead",
  walking: "Take a moment here",
  stationary: "Explore this story",
};

const weatherIcons: Record<WeatherCondition, React.ReactNode> = {
  clear: <Sun className="w-3 h-3" />,
  rain: <Cloud className="w-3 h-3" />,
  fog: <Cloud className="w-3 h-3 opacity-50" />,
  cloudy: <Cloud className="w-3 h-3" />,
};

const timeIcons: Record<TimeOfDay, React.ReactNode> = {
  morning: <Sun className="w-3 h-3 text-amber" />,
  afternoon: <Sun className="w-3 h-3 text-sunset-gold" />,
  evening: <Moon className="w-3 h-3 text-muted-indigo" />,
  night: <Moon className="w-3 h-3 text-midnight" />,
};

export function SmartNotification({
  story,
  isVisible,
  context = "stationary",
  timeOfDay = "afternoon",
  weather = "clear",
  distanceAway,
  upcomingCount = 0,
  onPlayNow,
  onPreview,
  onSnooze,
  onDismiss,
  onShowBundle,
  autoDismissDelay = 15000,
}: SmartNotificationProps) {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  // Generate adaptive teaser based on context
  const getAdaptiveTeaser = useCallback(() => {
    if (context === "driving") {
      return `${distanceAway || "Ahead"}: ${story.duration} story`;
    }
    if (weather === "rain") {
      return "Perfect moment for a story while you wait...";
    }
    if (timeOfDay === "evening" || timeOfDay === "night") {
      return "A quieter story for this time of day";
    }
    return story.teaser;
  }, [context, weather, timeOfDay, distanceAway, story]);

  useEffect(() => {
    if (!isVisible || isPaused) {
      if (!isVisible) {
        setProgress(100);
        setShowSnoozeOptions(false);
      }
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
  }, [isVisible, isPaused, autoDismissDelay, onDismiss]);

  if (!isVisible) return null;

  const showBundleIndicator = upcomingCount > 1;

  return (
    <div 
      className={cn(
        "fixed bottom-24 left-4 right-4 z-50",
        "animate-spring-up"
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div 
        className="bg-white rounded-2xl shadow-modal overflow-hidden"
        style={{ boxShadow: '0 12px 40px rgba(10, 26, 47, 0.2)' }}
      >
        {/* Progress bar with glow */}
        <div className="h-1 bg-muted relative overflow-hidden">
          <div 
            className="h-full bg-amber transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          {isPaused && (
            <div className="absolute inset-0 bg-amber/20 animate-pulse" />
          )}
        </div>

        <div className="p-4">
          {/* Context badge + Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {/* Context indicator */}
                <span className="flex items-center gap-1 text-xs text-adventure-green font-semibold">
                  <Zap className="w-3 h-3" />
                  {contextTeasers[context]}
                </span>
                
                {/* Weather/Time indicator */}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {weatherIcons[weather]}
                  {timeIcons[timeOfDay]}
                </span>

                {/* Bundle indicator */}
                {showBundleIndicator && (
                  <button
                    onClick={onShowBundle}
                    className="flex items-center gap-1 text-xs text-amber font-medium hover:text-sunset-gold transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    +{upcomingCount - 1} more
                  </button>
                )}
              </div>
              
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

          {/* Adaptive teaser */}
          <p className="text-sm text-muted-foreground mt-2">
            {getAdaptiveTeaser()}
          </p>

          {/* Meta with media indicators */}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {story.duration}
            </span>
            
            {story.hasAudio && (
              <span className="flex items-center gap-1 text-xs text-adventure-green">
                <Volume2 className="w-3 h-3" />
                Audio
              </span>
            )}
            
            {story.hasVideo && (
              <span className="flex items-center gap-1 text-xs text-sky-blue">
                <Play className="w-3 h-3" />
                Video
              </span>
            )}
            
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
