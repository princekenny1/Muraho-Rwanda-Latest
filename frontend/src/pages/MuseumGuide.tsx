import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  MapPin,
  ChevronRight,
  BookOpen,
  Route,
  Headphones,
  View,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1200&q=80";

interface MuseumGuideProps {
  museumId?: string;
  onBack?: () => void;
}

interface MuseumRelation {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  summary?: string;
  shortDescription?: string;
  description?: string;
}

interface MuseumDoc {
  id: string;
  slug?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  address?: string;
  openingHours?: Record<string, unknown>;
  etiquette?: string;
  safetyNotice?: string;
  visitorGuidance?: string;
  heroImage?: string | { url?: string };
  coverImage?: string;
  relatedStories?: Array<string | MuseumRelation>;
  relatedRoutes?: Array<string | MuseumRelation>;
}

const imageUrl = (museum: MuseumDoc): string => {
  if (typeof museum.heroImage === "string" && museum.heroImage.trim()) {
    return museum.heroImage;
  }

  if (
    museum.heroImage &&
    typeof museum.heroImage === "object" &&
    typeof museum.heroImage.url === "string"
  ) {
    return museum.heroImage.url;
  }

  if (typeof museum.coverImage === "string" && museum.coverImage.trim()) {
    return museum.coverImage;
  }

  return FALLBACK_COVER;
};

const normalizeRelation = (item: string | MuseumRelation) => {
  if (typeof item === "string") {
    return null;
  }

  const title = (item.title || item.name || "Untitled").trim();
  if (!title) return null;

  return {
    id: item.id || "",
    slug: item.slug || "",
    title,
    description: (item.summary || item.shortDescription || item.description || "").trim(),
  };
};

export function MuseumGuide({ museumId, onBack }: MuseumGuideProps) {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const museumSlug = museumId || slug;

  const { data: museum, isLoading, isError } = useQuery({
    queryKey: ["public-museum-guide", museumSlug],
    queryFn: async () => {
      const result = await api.find<MuseumDoc>("museums", {
        where: { slug: { equals: museumSlug } },
        limit: 1,
        depth: 2,
      });
      return result.docs[0] || null;
    },
    enabled: !!museumSlug,
  });

  const relatedStories = useMemo(
    () =>
      (museum?.relatedStories || [])
        .map(normalizeRelation)
        .filter((value): value is NonNullable<typeof value> => !!value),
    [museum],
  );

  const relatedRoutes = useMemo(
    () =>
      (museum?.relatedRoutes || [])
        .map(normalizeRelation)
        .filter((value): value is NonNullable<typeof value> => !!value),
    [museum],
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate("/memorials");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading museum...</p>
      </div>
    );
  }

  if (isError || !museum) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Museum not found</h1>
        <p className="text-muted-foreground">This museum page is unavailable right now.</p>
        <Button onClick={() => navigate("/memorials")}>Back to Memorials</Button>
      </div>
    );
  }

  const openingHours =
    typeof museum.openingHours?.daily === "string"
      ? museum.openingHours.daily
      : "Check on site";

  const museumName = museum.name || "Untitled Museum";
  const overview = museum.shortDescription || museum.description || "No museum overview available yet.";

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-64">
        <img src={imageUrl(museum)} alt={museumName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />

        <button
          onClick={handleBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center safe-area-pt"
        >
          <ArrowLeft className="w-5 h-5 text-midnight" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h1 className="font-serif text-2xl font-semibold text-white">{museumName}</h1>
          <div className="flex items-center gap-4 mt-2 text-white/70 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {openingHours}
            </span>
            {museum.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {museum.address}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="px-4 py-6 page-content-narrow">
        <div className="flex gap-3 mb-4">
          <Button size="lg" className="flex-1" onClick={() => navigate("/map")}> 
            <Headphones className="w-5 h-5 mr-2" />
            Open Map Guide
          </Button>
          <Button size="lg" variant="outline" className="flex-1" onClick={() => navigate("/map")}> 
            <View className="w-5 h-5 mr-2" />
            Explore Nearby
          </Button>
        </div>

        <Button
          size="lg"
          variant="secondary"
          className="w-full mb-6"
          onClick={() => navigate("/exhibition")}
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Explore Exhibition Panels
          <ChevronRight className="w-5 h-5 ml-auto" />
        </Button>

        <div className="mb-6">
          <h2 className="font-semibold text-foreground mb-2">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">{overview}</p>
        </div>

        <div className="mb-6 p-4 bg-muted-indigo/5 rounded-xl border-l-4 border-muted-indigo">
          <h3 className="font-medium text-foreground text-sm mb-2">Visitor Guidance</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {museum.visitorGuidance || museum.safetyNotice || museum.etiquette || "Visitor guidance will be available soon."}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-foreground mb-3">Related Stories</h2>
          {relatedStories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No linked stories yet.</p>
          ) : (
            <div className="space-y-3">
              {relatedStories.map((story) => (
                <button
                  key={story.id || story.slug || story.title}
                  onClick={() => story.slug && navigate(`/stories/${story.slug}`)}
                  className="w-full flex items-center justify-between p-3 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
                  disabled={!story.slug}
                >
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{story.title}</h4>
                    {story.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{story.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-foreground mb-3">Related Routes</h2>
          {relatedRoutes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No linked routes yet.</p>
          ) : (
            <div className="space-y-3">
              {relatedRoutes.map((route) => (
                <button
                  key={route.id || route.slug || route.title}
                  onClick={() => route.slug && navigate(`/routes/${route.slug}`)}
                  className="w-full flex items-center justify-between p-3 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
                  disabled={!route.slug}
                >
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{route.title}</h4>
                      {route.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{route.description}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
