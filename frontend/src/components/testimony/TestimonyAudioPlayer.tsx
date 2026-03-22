import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2, Mic, Maximize2, Minimize2, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useNarration } from "@/hooks/useNarration";
import { Button } from "@/components/ui/button";

interface TestimonyAudioPlayerProps {
  text: string;
  personName: string;
  coverImage?: string;
  audioUrl?: string;  // Real audio file URL (prioritized over TTS)
  voiceId?: string;
  isFocusMode: boolean;
  onFocusModeToggle: () => void;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export function TestimonyAudioPlayer({
  text,
  personName,
  coverImage,
  audioUrl,
  voiceId,
  isFocusMode,
  onFocusModeToggle,
  onTimeUpdate,
  className,
}: TestimonyAudioPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);

  // ── Real audio playback (when audioUrl is provided) ────────
  const hasRealAudio = !!audioUrl;
  const realAudioRef = useRef<HTMLAudioElement>(null);
  const [realIsPlaying, setRealIsPlaying] = useState(false);
  const [realCurrentTime, setRealCurrentTime] = useState(0);
  const [realDuration, setRealDuration] = useState(0);
  const [realReady, setRealReady] = useState(false);

  // Wire real <audio> events
  useEffect(() => {
    if (!hasRealAudio) return;
    const audio = realAudioRef.current;
    if (!audio) return;

    const onTimeUpdate_ = () => {
      setRealCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setRealDuration(audio.duration);
      }
      setRealReady(true);
    };
    const onEnded = () => setRealIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate_);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate_);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [hasRealAudio, onTimeUpdate]);

  // Sync volume on real audio
  useEffect(() => {
    const audio = realAudioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume / 100));
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const realTogglePlay = useCallback(async () => {
    const audio = realAudioRef.current;
    if (!audio) return;
    if (realIsPlaying) {
      audio.pause();
      setRealIsPlaying(false);
    } else {
      try {
        await audio.play();
        setRealIsPlaying(true);
      } catch (err) {
        console.error("Audio playback failed:", err);
      }
    }
  }, [realIsPlaying]);

  const realSeek = useCallback((time: number) => {
    const audio = realAudioRef.current;
    if (audio) {
      audio.currentTime = time;
      setRealCurrentTime(time);
    }
  }, []);

  // ── TTS narration (fallback when no real audio) ────────────
  const [hasGenerated, setHasGenerated] = useState(false);

  const {
    isLoading: ttsLoading,
    isPlaying: ttsIsPlaying,
    currentTime: ttsCurrentTime,
    duration: ttsDuration,
    error: ttsError,
    generateNarration,
    togglePlay: ttsTogglePlay,
    seek: ttsSeek,
    setVolume: ttsSetVolume,
    cleanup: ttsCleanup,
  } = useNarration({ onTimeUpdate });

  useEffect(() => {
    return () => ttsCleanup();
  }, [ttsCleanup]);

  const handleGenerate = async () => {
    const url = await generateNarration(text, voiceId);
    if (url) {
      setHasGenerated(true);
    }
  };

  // ── Unified interface ──────────────────────────────────────
  const isReady = hasRealAudio ? realReady : hasGenerated;
  const isPlaying = hasRealAudio ? realIsPlaying : ttsIsPlaying;
  const currentTime = hasRealAudio ? realCurrentTime : ttsCurrentTime;
  const duration = hasRealAudio ? realDuration : ttsDuration;
  const isLoading = hasRealAudio ? false : ttsLoading;
  const error = hasRealAudio ? null : ttsError;

  const handleTogglePlay = hasRealAudio ? realTogglePlay : ttsTogglePlay;
  const handleSeek = hasRealAudio ? realSeek : ttsSeek;

  const skipBackward = () => handleSeek(Math.max(0, currentTime - 15));
  const skipForward = () => handleSeek(Math.min(duration, currentTime + 15));

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (!hasRealAudio) ttsSetVolume(newVolume);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (!hasRealAudio) ttsSetVolume(volume);
    } else {
      setIsMuted(true);
      if (!hasRealAudio) ttsSetVolume(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden transition-all duration-500",
        isFocusMode ? "bg-midnight p-8" : "bg-card border border-border/50 p-6",
        className
      )}
    >
      {/* Hidden real audio element */}
      {hasRealAudio && (
        <audio ref={realAudioRef} src={audioUrl} preload="metadata" />
      )}

      {/* Focus Mode Toggle */}
      <button
        onClick={onFocusModeToggle}
        className={cn(
          "absolute top-4 right-4 p-2 rounded-lg transition-colors z-10",
          isFocusMode
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
        aria-label={isFocusMode ? "Exit focus mode" : "Enter focus mode"}
      >
        {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {/* Cover & Person */}
      <div className="flex items-center gap-4 mb-6">
        {coverImage && (
          <img
            src={coverImage}
            alt={personName}
            className={cn(
              "rounded-xl object-cover transition-all duration-300",
              isFocusMode ? "w-20 h-20" : "w-16 h-16"
            )}
          />
        )}
        <div>
          <h3 className={cn("font-semibold", isFocusMode ? "text-white text-lg" : "text-foreground")}>
            {personName}&rsquo;s Testimony
          </h3>
          <p className={cn("text-sm mt-0.5 flex items-center gap-1.5", isFocusMode ? "text-white/60" : "text-muted-foreground")}>
            {hasRealAudio ? (
              <><Headphones className="w-3.5 h-3.5" />{isReady ? formatTime(duration) : "Loading..."}</>
            ) : isReady ? formatTime(duration) : (
              <><Mic className="w-3.5 h-3.5" />AI Narration</>
            )}
          </p>
        </div>
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      {/* Show generate button only for TTS mode when not yet generated */}
      {!isReady && !hasRealAudio ? (
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className={cn(
            "w-full font-medium",
            isFocusMode ? "bg-soft-lavender text-midnight hover:bg-soft-lavender/90" : "bg-muted-indigo text-white hover:bg-muted-indigo/90"
          )}
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Audio...</>
          ) : (
            <><Mic className="w-4 h-4 mr-2" />Generate AI Narration</>
          )}
        </Button>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={(v) => handleSeek(v[0])} className="w-full" />
            <div className={cn("flex justify-between text-xs mt-2", isFocusMode ? "text-white/50" : "text-muted-foreground")}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8">
            <button onClick={skipBackward} className={cn("w-12 h-12 flex items-center justify-center rounded-full transition-colors relative", isFocusMode ? "text-white/70 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              <SkipBack className="w-5 h-5" /><span className="text-[10px] absolute -bottom-1">15</span>
            </button>

            <button onClick={handleTogglePlay} disabled={isLoading} className={cn("w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95", isFocusMode ? "bg-soft-lavender text-midnight hover:bg-soft-lavender/90" : "bg-muted-indigo text-white hover:bg-muted-indigo/90")}>
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>

            <button onClick={skipForward} className={cn("w-12 h-12 flex items-center justify-center rounded-full transition-colors relative", isFocusMode ? "text-white/70 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              <SkipForward className="w-5 h-5" /><span className="text-[10px] absolute -bottom-1">15</span>
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={toggleMute} className={cn("transition-colors", isFocusMode ? "text-white/50 hover:text-white" : "text-muted-foreground hover:text-foreground")}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Slider value={[isMuted ? 0 : volume]} max={100} step={1} onValueChange={handleVolumeChange} className="w-24" />
          </div>
        </>
      )}
    </div>
  );
}
