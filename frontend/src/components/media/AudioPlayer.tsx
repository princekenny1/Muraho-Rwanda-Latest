import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioUrl?: string;
  title: string;
  subtitle?: string;
  duration?: number; // in seconds
  coverImage?: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number) => void;
  variant?: "full" | "compact" | "mini";
  className?: string;
}

export function AudioPlayer({
  audioUrl,
  title,
  subtitle,
  duration = 900, // default 15 min
  coverImage,
  onPlayStateChange,
  onTimeUpdate,
  variant = "full",
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(duration);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Wire real <audio> events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setActualDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    audio.addEventListener("timeupdate", handleAudioTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleAudioTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [onPlayStateChange, onTimeUpdate]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        onPlayStateChange?.(true);
      } catch (err) {
        console.error("Audio playback failed:", err);
      }
    }
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 15);
      setCurrentTime(audio.currentTime);
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(actualDuration, audio.currentTime + 15);
      setCurrentTime(audio.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
    onTimeUpdate?.(value[0]);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume]);

  const progress = actualDuration > 0 ? (currentTime / actualDuration) * 100 : 0;

  if (variant === "mini") {
    return (
      <div className={cn("flex items-center gap-3 p-3 bg-midnight rounded-xl", className)}>
        {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-amber rounded-full flex items-center justify-center flex-shrink-0 hover:bg-sunset-gold transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-midnight fill-midnight" />
          ) : (
            <Play className="w-4 h-4 text-midnight fill-midnight ml-0.5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{title}</p>
          <div className="h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-sunset-gold rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-white/60 text-xs">{formatTime(currentTime)}</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("bg-midnight rounded-xl p-4", className)}>
        {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-amber rounded-full flex items-center justify-center flex-shrink-0 hover:bg-sunset-gold transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-midnight fill-midnight" />
            ) : (
              <Play className="w-5 h-5 text-midnight fill-midnight ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(actualDuration)}</span>
            </div>
            <Slider
              value={[currentTime]}
              max={actualDuration}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-midnight rounded-2xl p-5 animate-fade-up", className)}>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
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
          <Headphones className="w-5 h-5 text-amber" />
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={actualDuration}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-white/60 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(actualDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={skipBackward}
          className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <SkipBack className="w-5 h-5" />
          <span className="text-[10px] absolute mt-7">15</span>
        </button>

        <button
          onClick={togglePlay}
          className="w-16 h-16 bg-amber rounded-full flex items-center justify-center hover:bg-sunset-gold transition-colors active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 text-midnight fill-midnight" />
          ) : (
            <Play className="w-7 h-7 text-midnight fill-midnight ml-1" />
          )}
        </button>

        <button
          onClick={skipForward}
          className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
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
          onValueChange={(v) => {
            setVolume(v[0]);
            setIsMuted(false);
          }}
          className="w-24"
        />
      </div>
    </div>
  );
}
