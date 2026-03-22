import { useState, useRef, useEffect } from "react";
import { Play, Pause, Maximize2, Volume2, VolumeX, Subtitles, Cast, PictureInPicture2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface TestimonyVideoPlayerProps {
  videoUrl: string;
  posterImage?: string;
  captionsUrl?: string;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export function TestimonyVideoPlayer({
  videoUrl,
  posterImage,
  captionsUrl,
  currentTime: externalTime,
  onTimeUpdate,
  className,
}: TestimonyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate]);

  // Sync with external time (mode switching)
  useEffect(() => {
    if (externalTime !== undefined && videoRef.current) {
      const diff = Math.abs(videoRef.current.currentTime - externalTime);
      if (diff > 1) {
        videoRef.current.currentTime = externalTime;
      }
    }
  }, [externalTime]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      await video.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (video) {
      const newVolume = value[0] / 100;
      video.volume = newVolume;
      setVolume(value[0]);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen();
      }
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div
      className={cn("relative rounded-2xl overflow-hidden bg-midnight group", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterImage}
        className="w-full aspect-video object-cover"
        playsInline
      >
        {captionsUrl && (
          <track
            kind="captions"
            src={captionsUrl}
            label="English"
            default={showCaptions}
          />
        )}
      </video>

      {/* Play Button Overlay (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-midnight/40 transition-opacity"
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </button>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-midnight/90 to-transparent p-3 sm:p-4 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress Bar */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full mb-3"
        />

        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white/70 hover:text-white">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-16 sm:w-20 md:w-24 hidden sm:block"
              />
            </div>

            <span className="text-white/70 text-xs sm:text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showCaptions ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
              )}
              aria-label="Toggle captions"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            <button
              onClick={togglePiP}
              className="p-2 rounded-lg text-white/50 hover:text-white transition-colors"
              aria-label="Picture in Picture"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            <button
              className="p-2 rounded-lg text-white/50 hover:text-white transition-colors"
              aria-label="Cast"
            >
              <Cast className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-white/50 hover:text-white transition-colors"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
