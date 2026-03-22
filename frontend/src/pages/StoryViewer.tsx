import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowLeft, Heart, Share2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThenNowSlider } from "@/components/story/ThenNowSlider";
import { ImageLightbox } from "@/components/media/ImageLightbox";
import { ContentWarning } from "@/components/story/ContentWarning";
import { MultiModalStoryContainer } from "@/components/story/MultiModalStoryContainer";
import {
  SoundbedPicker,
  SoundbedType,
} from "@/components/story/SoundbedPicker";
import {
  BranchingNarrative,
  NarrativePath,
  JourneyMood,
} from "@/components/story/BranchingNarrative";
import { SourceChips } from "@/components/media/SourceChips";
import { cn } from "@/lib/utils";
import { useTimeOfDay } from "@/components/ambient/TimeOfDayMode";
import { getStoryContentForPath, getPathDuration } from "@/lib/storyContent";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import coverImg from "@/assets/cover.jpg";
import kctPost from "@/assets/KCT-Post.jpg";
import kctPrecolonial from "@/assets/KCT-precolonial.jpg";

interface StoryViewerProps {
  storyId?: string;
  onBack: () => void;
}

const mockStory = {
  id: "kgm-001",
  title: "Kigali Genocide Memorial",
  subtitle: "A place of remembrance and education",
  category: "Remembrance",
  duration: "15 min",
  hasSensitiveContent: true,
  coverImage: coverImg,
  videoUrl: "https://example.com/video.mp4",
  thenImage: kctPost,
  nowImage: kctPrecolonial,
  tags: ["Memorial", "History", "1994"],
  description: `The Kigali Genocide Memorial is the final resting place for more than 250,000 victims of the 1994 Genocide against the Tutsi. It serves as a place of remembrance, learning, and a tribute to the strength of survivors.

The memorial was opened in 2004, on the tenth anniversary of the Rwandan genocide. It contains the remains of over 250,000 people, making it the largest genocide memorial in Rwanda.`,
  theme: "Remembrance",
  themeColor: "#4B5573",
  // Story segments for multi-modal player
  segments: [
    {
      id: "seg-1",
      title: "Introduction",
      content:
        "The Kigali Genocide Memorial stands as Rwanda's principal site of remembrance for the 1994 genocide against the Tutsi. Located in the Gisozi district of Kigali, it serves both as a burial ground and an educational center.",
      startTime: 0,
      endTime: 180,
    },
    {
      id: "seg-2",
      title: "The Memorial Gardens",
      content:
        "The memorial gardens serve as a space for quiet reflection. As you walk through, you'll see the Wall of Names, inscribed with the names of victims whose identities have been recovered over the years.",
      startTime: 180,
      endTime: 420,
    },
    {
      id: "seg-3",
      title: "The Exhibition",
      content:
        "Inside the memorial, the permanent exhibition tells the story of Rwanda before, during, and after the genocide. It includes testimonies from survivors and artifacts from that period.",
      startTime: 420,
      endTime: 720,
    },
    {
      id: "seg-4",
      title: "Remembrance",
      content:
        "Today, the memorial serves not only as a place of mourning but as a center for education about the dangers of genocide and the importance of reconciliation.",
      startTime: 720,
      endTime: 900,
    },
  ],
  readContent: [
    {
      type: "paragraph",
      content:
        "The Kigali Genocide Memorial stands as Rwanda's principal site of remembrance for the 1994 genocide against the Tutsi. Located in the Gisozi district of Kigali, it serves both as a burial ground and an educational center.",
    },
    {
      type: "image",
      src: kctPost,
      caption: "The memorial gardens at sunrise",
    },
    {
      type: "quote",
      content:
        "To remember the victims is to not only honor their memory but to ensure that such tragedy never happens again.",
      author: "Survivor testimony",
    },
    {
      type: "paragraph",
      content:
        "The memorial gardens serve as a space for quiet reflection. As you walk through, you'll see the Wall of Names, inscribed with the names of victims whose identities have been recovered over the years.",
    },
  ],
  sources: [
    {
      id: "kgm",
      label: "Kigali Genocide Memorial",
      url: "https://kgm.rw",
      type: "museum" as const,
    },
    {
      id: "aegis",
      label: "Aegis Trust",
      url: "https://aegistrust.org",
      type: "institution" as const,
    },
    {
      id: "unesco",
      label: "UNESCO",
      url: "https://unesco.org",
      type: "archive" as const,
    },
  ],
};

export function StoryViewer({ storyId, onBack }: StoryViewerProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showThenNow, setShowThenNow] = useState(false);
  const [showWarning, setShowWarning] = useState(mockStory.hasSensitiveContent);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeSoundbed, setActiveSoundbed] = useState<SoundbedType>("none");
  const [currentPath, setCurrentPath] = useState<NarrativePath>("location");
  const [journeyMood, setJourneyMood] = useState<JourneyMood>("emotional");
  const [showBranching, setShowBranching] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const { isNightMode, themeOverrides } = useTimeOfDay();
  const story = mockStory;

  // Get path-specific content based on current selection
  const pathContent = useMemo(() => {
    return getStoryContentForPath(story.id, currentPath, journeyMood);
  }, [story.id, currentPath, journeyMood]);

  // Get duration for current path (convert string like "15 min" to seconds)
  const currentDuration = useMemo(() => {
    return getPathDuration(currentPath);
  }, [currentPath]);

  const totalDurationSeconds = useMemo(() => {
    const match = currentDuration.match(/(\d+)/);
    return match ? parseInt(match[1]) * 60 : 900; // Default 15 min
  }, [currentDuration]);

  // Progress tracking
  const { saveProgress, markComplete } = useProgressTracking({
    contentId: storyId || story.id,
    contentType: "story",
    title: story.title,
    imageUrl: story.coverImage,
    totalDurationSeconds,
  });

  // Track time updates from the multi-modal container
  const handleTimeUpdate = useCallback(
    (time: number) => {
      setCurrentTime(time);
      saveProgress(time);
    },
    [saveProgress],
  );

  // Handle story completion
  const handleComplete = useCallback(() => {
    markComplete();
    console.log("Story complete");
  }, [markComplete]);

  const images = story.readContent
    .filter((item) => item.type === "image" && "src" in item)
    .map((item, idx) => ({
      id: `img-${idx}`,
      src: (item as any).src,
      caption: (item as any).caption,
    }));

  const handleContinue = () => {
    setShowWarning(false);
  };

  const handleSkip = () => {
    setShowWarning(false);
    onBack();
  };

  if (showWarning) {
    return <ContentWarning onContinue={handleContinue} onSkip={handleSkip} />;
  }

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        backgroundColor: isNightMode ? themeOverrides.background : undefined,
        color: isNightMode ? themeOverrides.textPrimary : undefined,
      }}
    >
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 safe-area-pt">
        <div className="flex items-center justify-between h-14 px-4 page-content-narrow">
          <button
            onClick={onBack}
            className={cn(
              "w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-colors",
              isNightMode
                ? "bg-midnight/80 border border-white/10 hover:bg-midnight"
                : "bg-white/90 hover:bg-white",
            )}
          >
            <ArrowLeft
              className={cn(
                "w-5 h-5",
                isNightMode ? "text-white" : "text-midnight",
              )}
            />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                "w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-colors",
                isNightMode
                  ? "bg-midnight/80 border border-white/10 hover:bg-midnight"
                  : "bg-white/90 hover:bg-white",
              )}
            >
              <Heart
                className={cn(
                  "w-5 h-5",
                  isSaved
                    ? "fill-terracotta text-terracotta"
                    : isNightMode
                      ? "text-white"
                      : "text-midnight",
                )}
              />
            </button>
            <button
              className={cn(
                "w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-colors",
                isNightMode
                  ? "bg-midnight/80 border border-white/10 hover:bg-midnight"
                  : "bg-white/90 hover:bg-white",
              )}
            >
              <Share2
                className={cn(
                  "w-5 h-5",
                  isNightMode ? "text-white" : "text-midnight",
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="pb-24 page-content-narrow">
        {/* Hero Media Area with Then & Now toggle */}
        <div className="relative pt-14">
          <div className="relative aspect-[4/3]">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-midnight/30" />

            {/* Then & Now button */}
            {story.thenImage && (
              <button
                onClick={() => setShowThenNow(!showThenNow)}
                className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-midnight hover:bg-white transition-colors"
              >
                <Layers className="w-4 h-4" />
                Then & Now
              </button>
            )}

            {/* Branch narrative button */}
            <button
              onClick={() => setShowBranching(!showBranching)}
              className="absolute top-4 right-4 px-3 py-2 bg-adventure-green/90 backdrop-blur-sm rounded-full text-sm font-medium text-white hover:bg-adventure-green transition-colors"
            >
              Choose Path
            </button>
          </div>
        </div>

        {/* Then & Now Slider (expandable) */}
        {showThenNow && story.thenImage && (
          <div className="px-4 mt-4 animate-fade-in">
            <ThenNowSlider
              thenImage={story.thenImage}
              nowImage={story.nowImage}
              thenLabel="1994"
              nowLabel="2024"
            />
          </div>
        )}

        {/* Content */}
        <div className="px-4 mt-6">
          {/* Category badge */}
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-muted-indigo/10 text-muted-indigo mb-3">
            {story.category}
          </span>

          {/* Title */}
          <h1
            className={cn(
              "font-serif text-2xl font-semibold leading-tight",
              isNightMode ? "text-cloud-mist" : "text-foreground",
            )}
          >
            {story.title}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "px-2 py-0.5 text-xs rounded",
                  isNightMode
                    ? "bg-white/10 text-white/70"
                    : "bg-midnight/5 text-muted-foreground",
                )}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p
            className={cn(
              "mt-4 leading-relaxed",
              isNightMode ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {story.description.split("\n\n")[0]}
          </p>

          {/* Soundbed Picker */}
          <div className="mt-6">
            <SoundbedPicker
              activeSoundbed={activeSoundbed}
              onSoundbedChange={setActiveSoundbed}
              volume={0.5}
              onVolumeChange={(v) => console.log("Volume:", v)}
            />
          </div>

          {/* Branching Narrative (expandable) */}
          {showBranching && (
            <div className="mt-6 p-4 bg-card rounded-2xl border border-border/50 animate-fade-in">
              <h3 className="font-medium text-foreground mb-4">
                Customize Your Journey
              </h3>
              <BranchingNarrative
                storyId={story.id}
                currentPath={currentPath}
                journeyMood={journeyMood}
                onPathChange={setCurrentPath}
                onMoodChange={setJourneyMood}
              />
            </div>
          )}

          {/* Multi-Modal Story Container */}
          <div className="mt-6">
            <MultiModalStoryContainer
              key={`${currentPath}-${journeyMood}`}
              story={{
                id: story.id,
                title: story.title,
                coverImage: story.coverImage,
                duration: currentDuration,
                theme: story.theme,
                themeColor: story.themeColor,
                description: pathContent.description,
                segments: pathContent.segments,
                hasAudio: true,
                hasVideo: true,
              }}
              onComplete={handleComplete}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>

          {/* Sources */}
          <div className="mt-8">
            <h3
              className={cn(
                "text-sm font-medium mb-3",
                isNightMode ? "text-white" : "text-foreground",
              )}
            >
              Sources
            </h3>
            <SourceChips sources={story.sources} />
          </div>

          {/* CTA */}
          <Button className="w-full mt-8" size="lg" variant="museum">
            Open Museum Mode
          </Button>
        </div>
      </main>

      {/* Image Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
