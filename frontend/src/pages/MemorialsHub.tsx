import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Info,
  Play,
  ChevronRight,
  Star,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import kigaliMemorial from "@/assets/Kigali-Genocide-Memorial.jpg";
import murambiMemorial from "@/assets/Murambi-Genocide-Memorial.jpg";
import nyanzaMemorial from "@/assets/Nyanza-of-Butare-Genocide-memorial-.jpg";

interface MemorialsHubProps {
  onBack?: () => void;
  onMuseumClick?: (museumId: string) => void;
}

interface MuseumDoc {
  id: string;
  slug?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  address?: string;
  openingHours?: Record<string, any>;
  isFeatured?: boolean;
  isActive?: boolean;
  coverImage?: string;
  heroImage?: string | { url?: string };
}

const fallbackMuseums = [
  {
    id: "kgm",
    name: "Kigali Genocide Memorial",
    subtitle: "Rwanda's principal site of remembrance",
    hours: "8:00 AM - 5:00 PM",
    location: "Gisozi, Kigali",
    rating: 4.9,
    reviewCount: 2340,
    imageUrl: kigaliMemorial,
    category: "remembrance",
    featured: true,
  },
  {
    id: "campaign",
    name: "Campaign Against Genocide Museum",
    subtitle: "Inside the Parliament building",
    hours: "9:00 AM - 5:00 PM",
    location: "Kimihurura, Kigali",
    rating: 4.7,
    reviewCount: 890,
    imageUrl: murambiMemorial,
    category: "remembrance",
    featured: false,
  },
  {
    id: "ethnographic",
    name: "Ethnographic Museum",
    subtitle: "Rwanda's cultural heritage",
    hours: "8:00 AM - 6:00 PM",
    location: "Huye (Butare)",
    rating: 4.6,
    reviewCount: 567,
    imageUrl: nyanzaMemorial,
    category: "culture",
    featured: false,
  },
  {
    id: "kandt",
    name: "Kandt House Museum",
    subtitle: "Natural history of Rwanda",
    hours: "8:00 AM - 5:00 PM",
    location: "Nyarugenge, Kigali",
    rating: 4.5,
    reviewCount: 423,
    imageUrl: nyanzaMemorial,
    category: "history",
    featured: false,
  },
];

const categoryColors = {
  remembrance: "bg-muted-indigo",
  culture: "bg-terracotta",
  history: "bg-forest-teal",
};

export function MemorialsHub({ onBack, onMuseumClick }: MemorialsHubProps) {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-memorials-hub"],
    queryFn: async () => {
      const res = await api.find<MuseumDoc>("museums", {
        where: { isActive: { equals: true } },
        sort: "-isFeatured",
        limit: 100,
        depth: 1,
      });
      return res.docs;
    },
  });

  const museums = useMemo(() => {
    if (!data?.length) {
      return fallbackMuseums;
    }

    return data
      .filter((m) => m.slug && m.name)
      .map((m, index) => {
        const fallback = fallbackMuseums[index % fallbackMuseums.length];
        const hero =
          typeof m.heroImage === "string"
            ? m.heroImage
            : m.heroImage && typeof m.heroImage.url === "string"
              ? m.heroImage.url
              : null;
        const cover = m.coverImage && m.coverImage.trim() ? m.coverImage : null;

        return {
          id: m.id,
          slug: m.slug as string,
          name: m.name as string,
          subtitle: (
            m.shortDescription ||
            m.description ||
            fallback.subtitle ||
            ""
          ).trim(),
          hours:
            typeof m.openingHours?.daily === "string"
              ? m.openingHours.daily
              : fallback.hours,
          location: m.address || fallback.location,
          rating: fallback.rating,
          reviewCount: fallback.reviewCount,
          imageUrl: hero || cover || fallback.imageUrl,
          category: fallback.category,
          featured: !!m.isFeatured,
        };
      });
  }, [data]);

  const featuredMuseum = museums.find((m) => m.featured) || museums[0];
  const otherMuseums = museums.filter((m) => m.id !== featuredMuseum?.id);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate("/");
  };

  const handleMuseumClick = (museumSlug: string) => {
    if (onMuseumClick) {
      onMuseumClick(museumSlug);
      return;
    }
    navigate(`/museum-guide/${museumSlug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 safe-area-pt">
        <div className="flex items-center justify-between h-14 px-4 page-content-narrow">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-serif text-lg font-semibold text-foreground">
            Memorials & Museums
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-6 page-content-narrow">
        {/* Intro */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Explore Rwanda's memorials and museums with audio guides, exhibition
            maps, and on-site navigation
          </p>
        </div>

        {isLoading && (
          <div className="space-y-3 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Could not load memorials from backend. Showing fallback content.
          </div>
        )}

        {/* Exhibition Quick Access Card */}
        <button
          onClick={() => navigate("/exhibition")}
          className="w-full p-4 bg-gradient-to-r from-muted-indigo/10 to-forest-teal/10 rounded-xl border border-muted-indigo/20 mb-6 text-left hover:border-muted-indigo/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted-indigo/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-muted-indigo" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                Explore Exhibitions
              </h3>
              <p className="text-sm text-muted-foreground">
                Interactive panels with audio guides
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </button>

        {/* Featured Museum */}
        {featuredMuseum && (
          <button
            onClick={() =>
              handleMuseumClick(featuredMuseum.slug || featuredMuseum.id)
            }
            className="w-full relative overflow-hidden rounded-2xl mb-6 text-left"
            style={{ boxShadow: "0px 16px 40px rgba(0,0,0,0.15)" }}
          >
            <img
              src={featuredMuseum.imageUrl}
              alt={featuredMuseum.name}
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-transparent" />

            {/* Featured badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-amber text-midnight text-xs font-semibold rounded-full">
                Featured
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="font-serif text-xl font-semibold text-white">
                {featuredMuseum.name}
              </h2>
              <p className="text-white/70 text-sm mt-1">
                {featuredMuseum.subtitle}
              </p>

              <div className="flex items-center gap-4 mt-3 text-white/60 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredMuseum.hours}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber text-amber" />
                  {featuredMuseum.rating}
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Other Museums */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">All Museums</h3>

          {otherMuseums.map((museum) => (
            <button
              key={museum.id}
              onClick={() => handleMuseumClick(museum.slug || museum.id)}
              className="w-full flex items-center gap-3 p-3 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={museum.imageUrl}
                  alt={museum.name}
                  className="w-full h-full object-cover"
                />
                <div
                  className={cn(
                    "absolute bottom-1 left-1 w-2 h-2 rounded-full",
                    categoryColors[
                      museum.category as keyof typeof categoryColors
                    ],
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm line-clamp-1">
                  {museum.name}
                </h4>
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                  {museum.subtitle}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {museum.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber text-amber" />
                    {museum.rating}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
