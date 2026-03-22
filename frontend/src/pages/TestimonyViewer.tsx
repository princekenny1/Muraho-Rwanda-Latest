import { useState, useCallback, useMemo, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ContentWarningBanner,
  TestimonyHero,
  TestimonyModeSelector,
  TestimonyMode,
  TestimonyAudioPlayer,
  TestimonyVideoPlayer,
  TestimonyReadMode,
  TestimonyActions,
} from "@/components/testimony";
import { useTestimony } from "@/hooks/useTestimonies";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useProgressTracking } from "@/hooks/useProgressTracking";

export default function TestimonyViewer() {
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const { data: testimony, isLoading, error } = useTestimony(slug);
  
  const [mode, setMode] = useState<TestimonyMode>("audio");
  const [currentTime, setCurrentTime] = useState(0);
  const [isQuietMode, setIsQuietMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

  // Calculate total duration from testimony data
  const totalDurationSeconds = useMemo(() => {
    if (!testimony) return 600; // Default 10 minutes
    return (testimony.duration_minutes || 10) * 60;
  }, [testimony]);

  // Progress tracking
  const { saveProgress, markComplete } = useProgressTracking({
    contentId: testimony?.id || "",
    contentType: "testimony",
    title: testimony?.title || "",
    imageUrl: testimony?.cover_image,
    totalDurationSeconds,
  });

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    // Save progress when time updates
    if (testimony) {
      saveProgress(time);
    }
  }, [saveProgress, testimony]);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleModeChange = useCallback((newMode: TestimonyMode) => {
    setMode(newMode);
  }, []);

  const fullTranscriptText = useMemo(() => {
    if (!testimony) return "";
    return testimony.transcript_segments
      .filter((s) => !s.isPullQuote)
      .map((s) => s.text)
      .join(" ");
  }, [testimony]);

  // Mark as complete when user reaches near the end
  useEffect(() => {
    if (testimony && currentTime > 0) {
      const progressPercent = (currentTime / totalDurationSeconds) * 100;
      if (progressPercent >= 95) {
        markComplete();
      }
    }
  }, [currentTime, totalDurationSeconds, testimony, markComplete]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-md"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="h-80 relative">
          <Skeleton className="w-full h-full" />
        </div>
        
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !testimony) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-2">Testimony Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The testimony you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => navigate("/testimonies")}>
              Browse Testimonies
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isQuietMode ? "bg-midnight min-h-screen" : "bg-background min-h-screen"}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className={`fixed top-4 left-4 z-50 p-2 rounded-full backdrop-blur-md transition-colors ${
          isQuietMode
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-background/80 text-foreground hover:bg-muted"
        }`}
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Hero Section */}
      <TestimonyHero
        coverImage={testimony.cover_image}
        title={testimony.title}
        personName={testimony.person_name}
        context={testimony.context}
        isQuietMode={isQuietMode}
        onQuietModeToggle={() => setIsQuietMode(!isQuietMode)}
      />

      {/* Content */}
      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        {/* Content Warning */}
        {testimony.has_content_warning && !warningDismissed && (
          <ContentWarningBanner
            onDismiss={() => setWarningDismissed(true)}
            onSkip={() => navigate(-1)}
          />
        )}

        {/* Mode Selector */}
        <TestimonyModeSelector
          currentMode={mode}
          onModeChange={handleModeChange}
        />

        {/* Actions */}
        <TestimonyActions
          testimonyId={testimony.id}
          testimonyTitle={testimony.title}
          sources={testimony.sources}
        />

        {/* Mode Content */}
        <div className="animate-fade-in">
          {mode === "audio" && (
            <TestimonyAudioPlayer
              text={fullTranscriptText}
              personName={testimony.person_name}
              coverImage={testimony.cover_image}
              audioUrl={testimony.audio_url || undefined}
              isFocusMode={isFocusMode}
              onFocusModeToggle={() => setIsFocusMode(!isFocusMode)}
              onTimeUpdate={handleTimeUpdate}
            />
          )}

          {mode === "video" && (
            <TestimonyVideoPlayer
              videoUrl={testimony.video_url || "https://www.w3schools.com/html/mov_bbb.mp4"}
              posterImage={testimony.cover_image}
              captionsUrl={testimony.captions_url || undefined}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
            />
          )}

          {mode === "read" && (
            <div className={`rounded-2xl p-6 ${isQuietMode ? "bg-midnight/50" : "bg-card border border-border/50"}`}>
              <TestimonyReadMode
                segments={testimony.transcript_segments}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            </div>
          )}
        </div>

        {/* Transcript Preview (when in audio/video mode) */}
        {mode !== "read" && testimony.transcript_segments.length > 0 && (
          <div className={`rounded-xl p-4 ${isQuietMode ? "bg-white/5" : "bg-muted/30"}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-medium ${isQuietMode ? "text-white/70" : "text-muted-foreground"}`}>
                Transcript
              </h3>
              <button
                onClick={() => setMode("read")}
                className={`text-xs ${isQuietMode ? "text-soft-lavender" : "text-muted-indigo"} hover:underline`}
              >
                View full transcript
              </button>
            </div>
            <p className={`text-sm line-clamp-3 ${isQuietMode ? "text-white/60" : "text-muted-foreground"}`}>
              {testimony.transcript_segments.find(
                (s, i) => 
                  currentTime >= s.time && 
                  (i === testimony.transcript_segments.length - 1 || currentTime < testimony.transcript_segments[i + 1].time)
              )?.text || testimony.transcript_segments[0]?.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
