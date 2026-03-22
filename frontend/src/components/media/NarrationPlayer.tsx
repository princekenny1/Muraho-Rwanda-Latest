import { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useNarration } from "@/hooks/useNarration";
import { Button } from "@/components/ui/button";

interface NarrationPlayerProps {
  text: string;
  title: string;
  subtitle?: string;
  coverImage?: string;
  voiceId?: string;
  autoGenerate?: boolean;
  variant?: "full" | "compact" | "mini";
  className?: string;
}

export function NarrationPlayer({
  text,
  title,
  subtitle,
  coverImage,
  voiceId,
  autoGenerate = false,
  variant = "full",
  className,
}: NarrationPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [hasGenerated, setHasGenerated] = useState(false);

  const {
    isLoading,
    isPlaying,
    currentTime,
    duration,
    error,
    generateNarration,
    togglePlay,
    seek,
    setVolume: setAudioVolume,
    cleanup,
  } = useNarration();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  useEffect(() => {
    if (autoGenerate && text && !hasGenerated) {
      handleGenerate();
    }
  }, [autoGenerate, text, hasGenerated]);

  const handleGenerate = async () => {
    const url = await generateNarration(text, voiceId);
    if (url) {
      setHasGenerated(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setAudioVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setAudioVolume(volume);
      setIsMuted(false);
    } else {
      setAudioVolume(0);
      setIsMuted(true);
    }
  };

  const skipBackward = () => {
    seek(Math.max(0, currentTime - 15));
  };

  const skipForward = () => {
    seek(Math.min(duration, currentTime + 15));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (variant === "mini") {
    return (
      <div className={cn("flex items-center gap-3 p-3 bg-midnight rounded-xl", className)}>
        {!hasGenerated ? (
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-10 h-10 bg-amber rounded-full flex items-center justify-center p-0 hover:bg-sunset-gold"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-midnight animate-spin" />
            ) : (
              <Mic className="w-4 h-4 text-midnight" />
            )}
          </Button>
        ) : (
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-10 h-10 bg-amber rounded-full flex items-center justify-center flex-shrink-0 hover:bg-sunset-gold transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-midnight animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 text-midnight fill-midnight" />
            ) : (
              <Play className="w-4 h-4 text-midnight fill-midnight ml-0.5" />
            )}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{title}</p>
          <div className="h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-sunset-gold rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-white/60 text-xs">
          {hasGenerated ? formatTime(currentTime) : "--:--"}
        </span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("bg-midnight rounded-xl p-4", className)}>
        {error && (
          <p className="text-red-400 text-xs mb-2">{error}</p>
        )}
        <div className="flex items-center gap-4">
          {!hasGenerated ? (
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-12 h-12 bg-amber rounded-full flex items-center justify-center p-0 hover:bg-sunset-gold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-midnight animate-spin" />
              ) : (
                <Mic className="w-5 h-5 text-midnight" />
              )}
            </Button>
          ) : (
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 bg-amber rounded-full flex items-center justify-center flex-shrink-0 hover:bg-sunset-gold transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-midnight animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-midnight fill-midnight" />
              ) : (
                <Play className="w-5 h-5 text-midnight fill-midnight ml-0.5" />
              )}
            </button>
          )}
          <div className="flex-1">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{hasGenerated ? formatTime(currentTime) : "--:--"}</span>
              <span>{hasGenerated ? formatTime(duration) : "--:--"}</span>
            </div>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(v) => seek(v[0])}
              disabled={!hasGenerated}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-midnight rounded-2xl p-5 animate-fade-up", className)}>
      {/* Cover & Title */}
      {coverImage && (
        <div className="flex items-center gap-4 mb-5">
          <img
            src={coverImage}
            alt={title}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{title}</h3>
            {subtitle && (
              <p className="text-white/60 text-sm truncate mt-0.5">{subtitle}</p>
            )}
          </div>
          <Mic className="w-5 h-5 text-amber" />
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {!hasGenerated ? (
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-amber hover:bg-sunset-gold text-midnight font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Narration...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Generate AI Narration
            </>
          )}
        </Button>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(v) => seek(v[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={skipBackward}
              className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors relative"
            >
              <SkipBack className="w-5 h-5" />
              <span className="text-[10px] absolute mt-7">15</span>
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-16 h-16 bg-amber rounded-full flex items-center justify-center hover:bg-sunset-gold transition-colors active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-7 h-7 text-midnight animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 text-midnight fill-midnight" />
              ) : (
                <Play className="w-7 h-7 text-midnight fill-midnight ml-1" />
              )}
            </button>

            <button
              onClick={skipForward}
              className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors relative"
            >
              <SkipForward className="w-5 h-5" />
              <span className="text-[10px] absolute mt-7">15</span>
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </>
      )}
    </div>
  );
}
