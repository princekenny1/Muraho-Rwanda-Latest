import { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, 
  Volume2, VolumeX, Captions, ChevronUp, ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Chapter } from "./ChapterTimeline";

interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
}

interface DocumentaryPlayerProps {
  videoUrl?: string;
  posterUrl?: string;
  currentChapter: Chapter;
  chapters: Chapter[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  transcript?: TranscriptSegment[];
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  className?: string;
}

export function DocumentaryPlayer({
  videoUrl,
  posterUrl,
  currentChapter,
  chapters,
  currentTime,
  duration,
  isPlaying,
  transcript = [],
  onPlayPause,
  onSeek,
  onPrevChapter,
  onNextChapter,
  className,
}: DocumentaryPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const activeTranscriptRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentChapterIndex = chapters.findIndex(c => c.id === currentChapter.id);
  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < chapters.length - 1;

  // Sync video element with play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, videoUrl]);

  // Report time from real video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => onSeek(video.currentTime);
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [onSeek]);

  // Seek the video when external currentTime changes (chapter skip)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const diff = Math.abs(video.currentTime - currentTime);
    if (diff > 1.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  // Mute sync
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = isMuted;
  }, [isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const activeSegment = transcript.find(
    s => currentTime >= s.startTime && currentTime < s.endTime
  );

  useEffect(() => {
    if (activeTranscriptRef.current) {
      activeTranscriptRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeSegment?.id]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Video Player */}
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-video bg-midnight rounded-2xl overflow-hidden group",
          isFullscreen && "fixed inset-0 z-50 rounded-none"
        )}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Real video element */}
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
            alt={currentChapter.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}

        {/* Gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-midnight/90 via-transparent to-midnight/30 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )} />

        {/* Chapter indicator */}
        <div className={cn(
          "absolute top-4 left-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}>
          <div className="bg-midnight/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-xs text-white/70">Chapter {currentChapterIndex + 1}:</span>
            <span className="text-xs text-white ml-1 font-medium">{currentChapter.title}</span>
          </div>
        </div>

        {/* Captions */}
        {showCaptions && activeSegment && (
          <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 px-3 sm:px-4 text-center">
            <p className="inline-block bg-midnight/80 text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg max-w-[95%] sm:max-w-[90%]">
              {activeSegment.speaker && (
                <span className="text-amber font-medium">{activeSegment.speaker}: </span>
              )}
              {activeSegment.text}
            </p>
          </div>
        )}

        {/* Center play button */}
        {!isPlaying && (
          <button
            onClick={onPlayPause}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-amber transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: "0px 8px 32px rgba(255, 184, 92, 0.4)" }}
          >
            <Play className="w-8 h-8 text-midnight fill-midnight ml-1" />
          </button>
        )}

        {/* Controls bar */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-3 sm:p-4 transition-all duration-300",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {/* Progress */}
          <div className="mb-3">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={(v) => onSeek(v[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onPrevChapter}
                disabled={!hasPrev}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                  hasPrev 
                    ? "bg-white/10 hover:bg-white/20 text-white" 
                    : "text-white/30 cursor-not-allowed"
                )}
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={onPlayPause}
                className="w-12 h-12 bg-amber rounded-full flex items-center justify-center hover:bg-amber/90 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-midnight" />
                ) : (
                  <Play className="w-6 h-6 text-midnight ml-0.5" />
                )}
              </button>

              <button
                onClick={onNextChapter}
                disabled={!hasNext}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                  hasNext 
                    ? "bg-white/10 hover:bg-white/20 text-white" 
                    : "text-white/30 cursor-not-allowed"
                )}
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                  showCaptions ? "bg-amber/20 text-amber" : "text-white/70 hover:text-white"
                )}
              >
                <Captions className="w-5 h-5" />
              </button>

              <button
                onClick={async () => {
                  try {
                    if (document.fullscreenElement) {
                      await document.exitFullscreen();
                      setIsFullscreen(false);
                    } else if (containerRef.current) {
                      await containerRef.current.requestFullscreen();
                      setIsFullscreen(true);
                    }
                  } catch (err) {
                    console.error("Fullscreen error:", err);
                  }
                }}
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

      {/* Transcript Drawer */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Captions className="w-4 h-4" />
              View Full Transcript
            </span>
            <ChevronUp className="w-4 h-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader>
            <DrawerTitle>Transcript</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto max-h-[50vh]">
            <div className="space-y-4">
              {transcript.map((segment) => {
                const isActive = segment.id === activeSegment?.id;
                return (
                  <div
                    key={segment.id}
                    ref={isActive ? activeTranscriptRef : null}
                    onClick={() => onSeek(segment.startTime)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all duration-300",
                      isActive
                        ? "bg-amber/10 border-l-2 border-amber"
                        : "hover:bg-muted"
                    )}
                  >
                    {segment.speaker && (
                      <span className="text-xs font-semibold text-amber block mb-1">
                        {segment.speaker}
                      </span>
                    )}
                    <p className={cn(
                      "text-sm leading-relaxed",
                      isActive ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {segment.text}
                    </p>
                    <span className="text-xs text-muted-foreground/60 mt-1 block">
                      {formatTime(segment.startTime)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
