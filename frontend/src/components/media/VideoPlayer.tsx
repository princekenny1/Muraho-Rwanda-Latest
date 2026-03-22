import { useState, useRef, useEffect } from "react";
import { Play, Pause, Maximize2, Minimize2, Volume2, VolumeX, Captions, PictureInPicture2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  videoUrl?: string;
  posterUrl?: string;
  title?: string;
  duration?: number;
  captionsEnabled?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  className?: string;
}

export function VideoPlayer({
  videoUrl,
  posterUrl,
  title,
  duration = 600,
  captionsEnabled = true,
  onPlayStateChange,
  onFullscreenChange,
  className,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(duration);
  const [isMuted, setIsMuted] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Wire real <video> events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    const onLoadedMetadata = () => {
      if (video.duration && isFinite(video.duration)) {
        setActualDuration(video.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };
    const onPlay = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };
    const onPause = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("ended", onEnded);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [onPlayStateChange]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      try {
        await video.play();
      } catch (err) {
        console.error("Video playback failed:", err);
      }
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        onFullscreenChange?.(false);
      } else {
        await container.requestFullscreen();
        setIsFullscreen(true);
        onFullscreenChange?.(true);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const progress = actualDuration > 0 ? (currentTime / actualDuration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video bg-midnight rounded-2xl overflow-hidden group",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video element — always present, poster shows when paused */}
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted={isMuted}
        />
      ) : posterUrl ? (
        <img
          src={posterUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}

      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-midnight/90 via-transparent to-midnight/30 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )} />

      {/* Captions */}
      {showCaptions && captionsEnabled && (
        <div className="absolute bottom-20 left-0 right-0 px-4 text-center">
          <p className="inline-block bg-midnight/80 text-white text-sm px-3 py-1.5 rounded-lg">
            Sample caption text appears here during playback...
          </p>
        </div>
      )}

      {/* Center play button */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-amber transition-all hover:scale-105 active:scale-95"
          style={{ boxShadow: "0px 8px 32px rgba(255, 184, 92, 0.4)" }}
        >
          <Play className="w-8 h-8 text-midnight fill-midnight ml-1" />
        </button>
      )}

      {/* Controls bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 transition-all duration-300",
        showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        {/* Progress */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            max={actualDuration}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(actualDuration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {captionsEnabled && (
              <button
                onClick={toggleCaptions}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                  showCaptions ? "bg-amber/20 text-amber" : "text-white/70 hover:text-white"
                )}
              >
                <Captions className="w-5 h-5" />
              </button>
            )}

            <button
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
