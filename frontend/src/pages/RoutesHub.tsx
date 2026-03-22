import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Clock, MapPin, Route as RouteIcon } from "lucide-react";
import { api } from "@/lib/api/client";

interface RouteDoc {
  id: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  durationMinutes?: number;
  estimatedHours?: number;
  distanceKm?: number;
  coverImage?: string;
  heroImage?: string | { url?: string };
}

const getImageUrl = (doc: RouteDoc): string | null => {
  const hero = doc.heroImage;
  if (typeof hero === "string" && hero.trim()) return hero;
  if (hero && typeof hero === "object" && typeof hero.url === "string") {
    return hero.url;
  }

  if (typeof doc.coverImage === "string" && doc.coverImage.trim()) {
    return doc.coverImage;
  }

  return null;
};

const toDurationLabel = (doc: RouteDoc): string => {
  if (typeof doc.durationMinutes === "number" && doc.durationMinutes > 0) {
    return `${doc.durationMinutes} min`;
  }

  if (typeof doc.estimatedHours === "number" && doc.estimatedHours > 0) {
    const minutes = Math.round(doc.estimatedHours * 60);
    return `${minutes} min`;
  }

  return "Duration TBD";
};

export function RoutesHub() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-routes-hub"],
    queryFn: async () => {
      const published = await api.find<RouteDoc>("routes", {
        where: { status: { equals: "published" } },
        sort: "-updatedAt",
        limit: 100,
        depth: 1,
      });

      if (published.docs.length > 0) {
        return published.docs;
      }

      const fallback = await api.find<RouteDoc>("routes", {
        sort: "-updatedAt",
        limit: 100,
        depth: 1,
      });

      return fallback.docs;
    },
  });

  const routes = useMemo(
    () =>
      (data || []).filter((r) => r.slug && (r.title || r.name)).map((r) => ({
        id: r.id,
        slug: r.slug as string,
        title: (r.title || r.name || "Untitled Route").trim(),
        description: (r.description || r.shortDescription || "").trim(),
        durationLabel: toDurationLabel(r),
        distanceKm:
          typeof r.distanceKm === "number" && r.distanceKm > 0
            ? `${r.distanceKm} km`
            : null,
        imageUrl: getImageUrl(r),
      })),
    [data],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 safe-area-pt">
        <div className="flex items-center justify-between h-14 px-4 page-content-narrow">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-serif text-lg font-semibold text-foreground">
            Routes
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-6 page-content-narrow">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
            Curated Audio Journeys
          </h2>
          <p className="text-muted-foreground">
            Explore routes powered by live content from Muraho Rwanda.
          </p>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            We could not load routes from the backend right now. Please try again.
          </div>
        )}

        {!isLoading && !isError && routes.length === 0 && (
          <div className="rounded-xl border border-border/60 p-6 text-center text-muted-foreground">
            No routes available yet.
          </div>
        )}

        {!isLoading && !isError && routes.length > 0 && (
          <div className="space-y-3">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => navigate(`/routes/${route.slug}`)}
                className="w-full flex items-center gap-3 p-3 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
              >
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted/40">
                  {route.imageUrl ? (
                    <img
                      src={route.imageUrl}
                      alt={route.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <RouteIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm line-clamp-1">
                    {route.title}
                  </h3>
                  {route.description && (
                    <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                      {route.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {route.durationLabel}
                    </span>
                    {route.distanceKm && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {route.distanceKm}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
