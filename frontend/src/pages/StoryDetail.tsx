import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Play,
  Pause,
  Heart,
  Share2,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import coverImg from "@/assets/cover.jpg";

interface StoryDetailProps {
  onBack?: () => void;
}

interface StoryDoc {
  id: string;
  title?: string;
  slug?: string;
  summary?: string;
  body?: unknown;
  heroImage?: string | { url?: string };
  status?: string;
  themes?: Array<string | { id?: string; name?: string; slug?: string }>;
  location?:
    | string
    | { id?: string; slug?: string; name?: string; locationType?: string };
}

const getHeroImage = (story: StoryDoc): string => {
  if (typeof story.heroImage === "string" && story.heroImage.trim()) {
    return story.heroImage;
  }
  if (
    story.heroImage &&
    typeof story.heroImage === "object" &&
    story.heroImage.url
  ) {
    return story.heroImage.url;
  }
  return coverImg;
};

export function StoryDetail({ onBack }: StoryDetailProps) {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    data: story,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-story-detail", slug],
    queryFn: async () => {
      const result = await api.find<StoryDoc>("stories", {
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      });
      return result.docs[0] || null;
    },
    enabled: !!slug,
  });

  const primaryTheme = useMemo(() => {
    const first = Array.isArray(story?.themes) ? story?.themes[0] : null;
    if (first && typeof first === "object" && first.name) {
      return first.name;
    }
    return "Story";
  }, [story]);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  const handleMuseumMode = () => {
    const location = story?.location;
    if (location && typeof location === "object" && location.slug) {
      navigate(`/museum-guide/${location.slug}`);
      return;
    }
    navigate("/memorials");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading story...</p>
      </div>
    );
  }

  if (isError || !story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Story not found</h1>
        <p className="text-muted-foreground">
          This story is unavailable or not published yet.
        </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 safe-area-pt">
        <div className="flex items-center justify-between h-14 px-4 page-content-narrow">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-midnight" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
            >
              <Heart
                className={cn(
                  "w-5 h-5",
                  isSaved ? "fill-terracotta text-terracotta" : "text-midnight",
                )}
              />
            </button>
            <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5 text-midnight" />
            </button>
          </div>
        </div>
      </header>

      <main className="pb-8">
        {/* Hero Image - No Then & Now for story pages */}
        <div className="relative h-64 sm:h-72">
          <img
            src={getHeroImage(story)}
            alt={story.title || "Story"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="px-4 -mt-8 relative z-10">
          {/* Mode Badge */}
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-muted-indigo/10 text-muted-indigo mb-3">
            {primaryTheme}
          </span>

          <h1 className="font-serif text-2xl font-semibold text-foreground">
            {story.title || "Untitled Story"}
          </h1>

          <p className="text-muted-foreground mt-2 leading-relaxed">
            {story.summary || "No story summary available yet."}
          </p>

          {/* Audio Player */}
          <div className="mt-6 bg-midnight rounded-xl p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 bg-amber rounded-full flex items-center justify-center flex-shrink-0 hover:bg-sunset-gold transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-midnight fill-midnight" />
                ) : (
                  <Play className="w-6 h-6 text-midnight fill-midnight ml-1" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>4:32</span>
                  <span>15:00</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-[30%] bg-sunset-gold rounded-full" />
                </div>
              </div>
            </div>

            {/* Transcript Toggle */}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-2 mt-4 text-white/80 text-sm hover:text-white transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {showTranscript ? "Hide transcript" : "Show transcript"}
            </button>

            {showTranscript && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg text-white/90 text-sm leading-relaxed animate-fade-up">
                <p>
                  "The memorial gardens serve as a space for quiet reflection.
                  As you walk through, you'll see the Wall of Names, inscribed
                  with the names of victims whose identities have been
                  recovered..."
                </p>
              </div>
            )}
          </div>

          {/* Sources */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-midnight mb-3">Sources</h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-violet text-white text-xs font-medium rounded-full">
              Muraho Content API
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          {/* CTA */}
          <Button
            className="w-full mt-8"
            size="lg"
            variant="museum"
            onClick={handleMuseumMode}
          >
            Open Museum Mode
          </Button>
        </div>
      </main>
    </div>
  );
}
