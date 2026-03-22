import { Clock, MapPin, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueuedStory {
  id: string;
  title: string;
  coverImage: string;
  duration: string;
  distance: string;
  isPlayed: boolean;
  isCurrent: boolean;
}

interface NotificationQueueProps {
  stories: QueuedStory[];
  isOpen: boolean;
  onClose: () => void;
  onPlayStory: (storyId: string) => void;
  onRemoveFromQueue: (storyId: string) => void;
}

export function NotificationQueue({
  stories,
  isOpen,
  onClose,
  onPlayStory,
  onRemoveFromQueue,
}: NotificationQueueProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-modal animate-slide-up max-h-[70vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-serif font-semibold text-lg text-foreground">
              Upcoming Stories
            </h2>
            <p className="text-sm text-muted-foreground">
              {stories.filter(s => !s.isPlayed).length} stories on your route
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stories list */}
        <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
          {stories.map((story, index) => (
            <div 
              key={story.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-colors",
                story.isCurrent && "bg-amber/10 border-2 border-amber",
                story.isPlayed && !story.isCurrent && "opacity-50",
                !story.isPlayed && !story.isCurrent && "bg-muted/50 hover:bg-muted"
              )}
            >
              {/* Progress indicator */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                    story.isPlayed ? "bg-adventure-green text-white" : 
                    story.isCurrent ? "bg-amber text-midnight" : 
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {story.isPlayed ? "✓" : index + 1}
                </div>
                {index < stories.length - 1 && (
                  <div className={cn(
                    "w-0.5 h-6",
                    story.isPlayed ? "bg-adventure-green" : "bg-muted"
                  )} />
                )}
              </div>

              {/* Cover image */}
              <div 
                className="w-16 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${story.coverImage})` }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-medium text-sm truncate",
                  story.isPlayed ? "text-muted-foreground" : "text-foreground"
                )}>
                  {story.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {story.duration}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {story.distance}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {!story.isPlayed && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPlayStory(story.id)}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                      story.isCurrent 
                        ? "bg-amber text-midnight" 
                        : "bg-midnight text-white hover:bg-midnight/80"
                    )}
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => onRemoveFromQueue(story.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
