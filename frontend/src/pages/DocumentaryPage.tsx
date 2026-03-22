import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DocumentaryHero,
  ChapterTimeline,
  DocumentaryPlayer,
  SupplementarySection,
  DocumentaryActions,
  Chapter,
} from "@/components/documentary";
import {
  useDocumentary,
  useDocumentaryChapters,
  Chapter as DbChapter,
  TranscriptSegment,
} from "@/hooks/useDocumentaries";

// Resume playback storage key
const getResumeKey = (slug: string) => `documentary-resume-${slug}`;

// Transform DB chapters to UI chapters
function transformChapters(dbChapters: DbChapter[], completedIds: string[]): Chapter[] {
  return dbChapters.map((ch) => ({
    id: ch.id,
    title: ch.title,
    duration: ch.duration,
    type: ch.type as Chapter["type"],
    isCompleted: completedIds.includes(ch.id),
  }));
}

function LoadingSkeleton() {
  return (
    <div className="pt-16 p-4 space-y-4">
      <Skeleton className="w-full aspect-video rounded-2xl" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 mt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DocumentaryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const { data: documentary, isLoading: docLoading, error: docError } = useDocumentary(slug);
  const { data: dbChapters = [], isLoading: chaptersLoading } = useDocumentaryChapters(documentary?.id);
  
  const [isWatching, setIsWatching] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);

  const chapters = transformChapters(dbChapters, completedChapters);
  const currentChapter = chapters.find(c => c.id === currentChapterId) || chapters[0];
  const currentChapterIndex = chapters.findIndex(c => c.id === currentChapterId);

  // Build transcript from current chapter's DB data
  const currentTranscript: TranscriptSegment[] = useMemo(() => {
    if (!currentChapterId || dbChapters.length === 0) return [];
    const dbChapter = dbChapters.find(c => c.id === currentChapterId);
    return dbChapter?.transcripts || [];
  }, [currentChapterId, dbChapters]);

  // Build supplementary from documentary data (real DB, fallback empty)
  const photos = useMemo(() => documentary?.photos || [], [documentary]);
  const essays = useMemo(() => documentary?.essays || [], [documentary]);
  const sources = useMemo(() =>
    (documentary?.sources || []).map(s => ({
      id: s.id,
      title: s.name,
      type: s.type || "",
      institution: s.institution || "",
      url: s.url || "#",
    })),
    [documentary]
  );
  const downloads = useMemo(() =>
    (documentary?.downloads || []).map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      size: d.size || "",
    })),
    [documentary]
  );

  // Set initial chapter when data loads
  useEffect(() => {
    if (dbChapters.length > 0 && !currentChapterId) {
      setCurrentChapterId(dbChapters[0].id);
    }
  }, [dbChapters, currentChapterId]);

  // Load resume position on mount
  useEffect(() => {
    if (slug) {
      const savedData = localStorage.getItem(getResumeKey(slug));
      if (savedData) {
        try {
          const { chapterId, time, completed } = JSON.parse(savedData);
          setCurrentChapterId(chapterId);
          setCurrentTime(time);
          setCompletedChapters(completed || []);
        } catch (e) {
          // Invalid saved data, ignore
        }
      }
    }
  }, [slug]);

  // Save resume position on time/chapter change
  useEffect(() => {
    if (slug && isWatching && currentChapterId) {
      localStorage.setItem(getResumeKey(slug), JSON.stringify({
        chapterId: currentChapterId,
        time: currentTime,
        completed: completedChapters,
      }));
    }
  }, [slug, currentChapterId, currentTime, completedChapters, isWatching]);

  const handleStart = () => {
    setIsWatching(true);
    setIsPlaying(true);
  };

  const handleChapterSelect = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    setCurrentTime(0);
    if (!isWatching) {
      setIsWatching(true);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1];
      setCurrentChapterId(prevChapter.id);
      setCurrentTime(0);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      // Mark current as completed
      if (currentChapterId && !completedChapters.includes(currentChapterId)) {
        setCompletedChapters([...completedChapters, currentChapterId]);
      }
      const nextChapter = chapters[currentChapterIndex + 1];
      setCurrentChapterId(nextChapter.id);
      setCurrentTime(0);
    }
  };

  const isLoading = docLoading || chaptersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (docError || !documentary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Documentary not found</p>
          <Button onClick={() => navigate("/documentaries")}>
            Browse Documentaries
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-foreground truncate">
            {isWatching && currentChapter ? currentChapter.title : "Documentary"}
          </h1>
        </div>
      </div>

      <ScrollArea className="h-screen pt-16">
        {!isWatching ? (
          <>
            {/* Hero Cover */}
            <DocumentaryHero
              title={documentary.title}
              synopsis={documentary.synopsis}
              runtime={documentary.runtime}
              coverImage={documentary.cover_image}
              year={documentary.year}
              director={documentary.director || undefined}
              onStart={handleStart}
            />

            {/* Chapter Timeline */}
            {chapters.length > 0 && (
              <ChapterTimeline
                chapters={chapters}
                currentChapterId={currentChapterId || chapters[0]?.id}
                onChapterSelect={handleChapterSelect}
              />
            )}

            {/* Actions */}
            <DocumentaryActions
              downloadableAssets={downloads}
            />

            {/* Supplementary Content */}
            <SupplementarySection
              photos={photos}
              essays={essays}
              primarySources={sources}
            />
          </>
        ) : (
          <div className="pb-8">
            {/* Video Player */}
            {currentChapter && (
              <div className="p-3 sm:p-4 media-container">
                <DocumentaryPlayer
                  videoUrl={documentary.video_url || undefined}
                  posterUrl={documentary.cover_image}
                  currentChapter={currentChapter}
                  chapters={chapters}
                  currentTime={currentTime}
                  duration={currentChapter.duration}
                  isPlaying={isPlaying}
                  transcript={currentTranscript}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                  onSeek={setCurrentTime}
                  onPrevChapter={handlePrevChapter}
                  onNextChapter={handleNextChapter}
                />
              </div>
            )}

            {/* Chapter Timeline */}
            {chapters.length > 0 && (
              <ChapterTimeline
                chapters={chapters}
                currentChapterId={currentChapterId || chapters[0]?.id}
                onChapterSelect={handleChapterSelect}
              />
            )}

            {/* Actions */}
            <DocumentaryActions
              downloadableAssets={downloads}
            />

            {/* Supplementary Content */}
            <SupplementarySection
              photos={photos}
              essays={essays}
              primarySources={sources}
            />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default DocumentaryPage;
