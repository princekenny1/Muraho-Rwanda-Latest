import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Headphones, Video, BookOpen, Settings, Maximize, X, ChevronDown, ChevronUp, Sparkles, Loader2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNarration } from "@/hooks/useNarration";

export type StoryMode = "audio" | "video" | "read";
export type StoryVersion = "default" | "history" | "personal" | "kids";

interface StorySegment {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  startTime: number; // seconds
  endTime: number;
}

interface MultiModalStoryContainerProps {
  story: {
    id: string;
    title: string;
    coverImage: string;
    duration: string;
    theme: string;
    themeColor: string;
    description: string;
    segments: StorySegment[];
    hasAudio: boolean;
    hasVideo: boolean;
  };
  initialMode?: StoryMode;
  onClose?: () => void;
  onComplete?: (storyId: string) => void;
  onTimeUpdate?: (timeSeconds: number) => void;
}

const modeConfig = {
  audio: { icon: Headphones, label: "Audio" },
  video: { icon: Video, label: "Video" },
  read: { icon: BookOpen, label: "Read" },
};

const versionLabels: Record<StoryVersion, { label: string; description: string }> = {
  default: { label: "Standard", description: "Full narrative experience" },
  history: { label: "History Mode", description: "Focus on historical context" },
  personal: { label: "Personal Voices", description: "Survivor testimonies" },
  kids: { label: "Kid-Friendly", description: "Gentler retelling" },
};

export function MultiModalStoryContainer({
  story,
  initialMode = "audio",
  onClose,
  onComplete,
  onTimeUpdate,
}: MultiModalStoryContainerProps) {
  const [activeMode, setActiveMode] = useState<StoryMode>(initialMode);
  const [activeVersion, setActiveVersion] = useState<StoryVersion>("default");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [showVersionPicker, setShowVersionPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasGeneratedNarration, setHasGeneratedNarration] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI Narration hook
  const narration = useNarration({
    onPlayStateChange: setIsPlaying,
    onTimeUpdate: setCurrentTime,
  });

  // Get full story text for narration
  const fullStoryText = story.segments.map(s => s.content).join('\n\n');

  // Generate AI narration
  const handleGenerateNarration = async () => {
    const url = await narration.generateNarration(fullStoryText);
    if (url) {
      setHasGeneratedNarration(true);
    }
  };

  // Sync playback state across modes
  const handleModeChange = useCallback((newMode: StoryMode) => {
    const wasPlaying = isPlaying;
    const savedTime = currentTime;
    
    setIsPlaying(false);
    setActiveMode(newMode);
    
    // Resume at same position in new mode
    setTimeout(() => {
      if (newMode === "audio" && audioRef.current) {
        audioRef.current.currentTime = savedTime;
        if (wasPlaying) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      } else if (newMode === "video" && videoRef.current) {
        videoRef.current.currentTime = savedTime;
        if (wasPlaying) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }
    }, 100);
  }, [isPlaying, currentTime]);

  // Find active segment based on current time
  useEffect(() => {
    const segment = story.segments.findIndex(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );
    if (segment !== -1 && segment !== activeSegmentIndex) {
      setActiveSegmentIndex(segment);
    }
  }, [currentTime, story.segments, activeSegmentIndex]);

  // Sync duration from narration
  useEffect(() => {
    if (hasGeneratedNarration && narration.duration > 0) {
      setDuration(narration.duration);
    }
  }, [hasGeneratedNarration, narration.duration]);

  // Simulate playback for demo (only when not using real narration)
  useEffect(() => {
    if (!isPlaying || hasGeneratedNarration) return;
    
    const totalDuration = story.segments.reduce((acc, s) => Math.max(acc, s.endTime), 0);
    setDuration(totalDuration);
    
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          onComplete?.(story.id);
          return prev;
        }
        const newTime = prev + 0.1;
        // Report time updates for progress tracking
        onTimeUpdate?.(newTime);
        return newTime;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying, story, onComplete, hasGeneratedNarration, onTimeUpdate]);

  const togglePlayPause = () => {
    if (hasGeneratedNarration) {
      narration.togglePlay();
    } else {
      setIsPlaying(!isPlaying);
    }
  };
  
  const skipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    if (hasGeneratedNarration) {
      narration.seek(newTime);
    }
    setCurrentTime(newTime);
  };
  
  const skipForward = () => {
    const totalDuration = story.segments.reduce((acc, s) => Math.max(acc, s.endTime), 0);
    const newTime = Math.min(hasGeneratedNarration ? narration.duration : totalDuration, currentTime + 10);
    if (hasGeneratedNarration) {
      narration.seek(newTime);
    }
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const activeSegment = story.segments[activeSegmentIndex];

  return (
    <div 
      ref={containerRef}
      className={cn(
        "bg-midnight text-white rounded-2xl overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-lg font-semibold truncate">{story.title}</h2>
          <p className="text-sm text-white/60">{story.duration}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Version picker */}
          <div className="relative">
            <button
              onClick={() => setShowVersionPicker(!showVersionPicker)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-sm hover:bg-white/20 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber" />
              {versionLabels[activeVersion].label}
              {showVersionPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            {showVersionPicker && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-midnight border border-white/10 rounded-xl shadow-lg overflow-hidden z-10">
                {Object.entries(versionLabels).map(([key, { label, description }]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveVersion(key as StoryVersion);
                      setShowVersionPicker(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-white/10 transition-colors",
                      activeVersion === key && "bg-amber/20"
                    )}
                  >
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-white/50">{description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Maximize className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Media area */}
      <div className="relative aspect-video bg-black overflow-hidden rounded-lg sm:rounded-xl">
        {activeMode === "video" ? (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${activeSegment?.imageUrl || story.coverImage})` }}
          >
            <div className="absolute inset-0 flex items-center justify-center bg-midnight/40">
              <p className="text-sm text-white/80">Video player placeholder</p>
            </div>
          </div>
        ) : activeMode === "audio" ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-midnight via-muted-indigo/30 to-midnight gap-4">
            <div 
              className="w-48 h-48 rounded-2xl bg-cover bg-center shadow-2xl"
              style={{ 
                backgroundImage: `url(${story.coverImage})`,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            />
            {!hasGeneratedNarration && (
              <button
                onClick={handleGenerateNarration}
                disabled={narration.isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-amber/90 hover:bg-amber text-midnight rounded-full text-sm font-medium transition-colors disabled:opacity-50"
              >
                {narration.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating AI Voice...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Generate AI Narration
                  </>
                )}
              </button>
            )}
            {narration.error && (
              <p className="text-red-400 text-xs">{narration.error}</p>
            )}
          </div>
        ) : (
          <div 
            className="w-full h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${activeSegment?.imageUrl || story.coverImage})` }}
          />
        )}

        {/* Mode switcher overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 p-1 bg-midnight/80 backdrop-blur-sm rounded-xl">
            {(["audio", "video", "read"] as StoryMode[]).map((mode) => {
              const config = modeConfig[mode];
              const Icon = config.icon;
              const isDisabled = (mode === "audio" && !story.hasAudio) || (mode === "video" && !story.hasVideo);
              
              return (
                <button
                  key={mode}
                  onClick={() => !isDisabled && handleModeChange(mode)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeMode === mode
                      ? "bg-amber text-midnight"
                      : isDisabled
                      ? "text-white/30 cursor-not-allowed"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transport controls */}
      {activeMode !== "read" && (
        <div className="px-4 py-3 border-b border-white/10">
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-white/60 w-10">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber transition-all duration-100"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-white/60 w-10 text-right">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/60"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={skipBack}
                className="w-12 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button
                onClick={togglePlayPause}
                disabled={activeMode === "audio" && !hasGeneratedNarration && !narration.isLoading}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                  activeMode === "audio" && !hasGeneratedNarration
                    ? "bg-white/20 text-white/40 cursor-not-allowed"
                    : "bg-amber text-midnight hover:bg-sunset-gold"
                )}
              >
                {narration.isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </button>
              
              <button
                onClick={skipForward}
                className="w-12 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                showTranscript ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
              )}
            >
              Transcript
            </button>
          </div>
        </div>
      )}

      {/* Content area - Transcript/Read mode */}
      <div className={cn(
        "overflow-y-auto transition-all",
        activeMode === "read" ? "max-h-[400px]" : showTranscript ? "max-h-48" : "max-h-0"
      )}>
        <div className="p-4 space-y-4">
          {story.segments.map((segment, index) => (
            <div 
              key={segment.id}
              className={cn(
                "transition-all duration-300",
                index === activeSegmentIndex && activeMode !== "read" && "bg-amber/10 -mx-2 px-2 py-2 rounded-lg"
              )}
            >
              {segment.title && (
                <h3 className="font-semibold text-sm mb-1">{segment.title}</h3>
              )}
              <p className={cn(
                "text-sm leading-relaxed",
                index === activeSegmentIndex ? "text-white" : "text-white/60"
              )}>
                {segment.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Segment navigation */}
      <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {story.segments.map((segment, index) => (
          <button
            key={segment.id}
            onClick={() => {
              setCurrentTime(segment.startTime);
              setActiveSegmentIndex(index);
            }}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              index === activeSegmentIndex
                ? "bg-amber text-midnight"
                : index < activeSegmentIndex
                ? "bg-white/20 text-white"
                : "bg-white/10 text-white/60 hover:text-white"
            )}
          >
            {segment.title || `Part ${index + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
}
