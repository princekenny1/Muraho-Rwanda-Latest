import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  MapPin,
  Clock,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import { normalizeMediaUrl } from "@/lib/mediaUrl";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Route, RouteStop, StopContentBlock } from "@/types/routes";

const themeColors: Record<string, string> = {
  location: "bg-amber",
  museum: "bg-muted-indigo",
  culture: "bg-terracotta",
  history: "bg-muted-indigo",
  nature: "bg-adventure-green",
  food: "bg-terracotta",
  accommodation: "bg-forest-teal",
};

const routeStopIcon = L.divIcon({
  className: "muraho-route-stop-pin",
  html: '<div style="width:12px;height:12px;background:#f59e0b;border:2px solid white;border-radius:9999px;box-shadow:0 0 0 2px rgba(245,158,11,0.25)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// TEMP fallback while all route image blocks are completed in CMS.
const TEMP_ROUTE_GALLERY_FALLBACK = [
  "/content/routes/musanze.jpg",
  "/content/routes/ibirunga.jpg",
  "/content/routes/lake-kivu-medium.jpg",
  "/content/routes/lake-kivu-shore.webp",
];

const toLatLngPath = (path: unknown): [number, number][] => {
  const src = path as any;
  if (!src) return [];

  const normalizeLineString = (coords: unknown[]): [number, number][] =>
    coords
      .filter((c) => Array.isArray(c) && c.length >= 2)
      .map((c) => [Number((c as number[])[1]), Number((c as number[])[0])])
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

  if (src.type === "LineString" && Array.isArray(src.coordinates)) {
    return normalizeLineString(src.coordinates);
  }

  if (
    src.type === "Feature" &&
    src.geometry?.type === "LineString" &&
    Array.isArray(src.geometry.coordinates)
  ) {
    return normalizeLineString(src.geometry.coordinates);
  }

  return [];
};

const getImageUrlsFromStops = (stops: RouteStop[]): string[] => {
  const urls: string[] = [];

  stops.forEach((stop) => {
    stop.content_blocks.forEach((block) => {
      if (block.block_type !== "image") return;

      const content = block.content as any;
      const images = Array.isArray(content?.images) ? content.images : [];

      images.forEach((image: any) => {
        const url = typeof image?.url === "string" ? image.url.trim() : "";
        if (url) {
          urls.push(normalizeMediaUrl(url));
        }
      });
    });
  });

  return urls;
};

export default function RouteViewer() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [route, setRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStop, setActiveStop] = useState<RouteStop | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!slug) return;

      const routeRes = await api.find("routes", {
        where: { slug: { equals: slug } },
        limit: 1,
      });
      const routeData = routeRes.docs[0] || null;

      if (!routeData) {
        navigate("/");
        return;
      }

      const normalizedRoute: Route = {
        id: String((routeData as any).id || ""),
        title:
          (routeData as any).title ||
          (routeData as any).name ||
          "Untitled Route",
        slug: (routeData as any).slug || "",
        description:
          (routeData as any).description ||
          (routeData as any).shortDescription ||
          null,
        cover_image:
          normalizeMediaUrl(
            typeof (routeData as any).heroImage === "string"
              ? (routeData as any).heroImage
              : (routeData as any).heroImage?.url ||
                  (routeData as any).coverImage,
          ) || null,
        duration_minutes:
          (routeData as any).durationMinutes ||
          (routeData as any).duration_minutes ||
          null,
        estimated_hours: (routeData as any).estimatedHours || null,
        difficulty: ((routeData as any).difficulty ||
          "moderate") as Route["difficulty"],
        distance_km:
          (routeData as any).distanceKm ||
          (routeData as any).distance_km ||
          null,
        transport_mode: (routeData as any).transportMode || null,
        access_level: "free",
        category: null,
        sensitivity_level: null,
        offline_available: false,
        status: ((routeData as any).status || "draft") as Route["status"],
        created_by: null,
        published_at: (routeData as any).publishedAt || null,
        stops: [],
      };

      setRoute(normalizedRoute);
      setRoutePath(toLatLngPath((routeData as any).routePath));

      const stopsRes = await api.find("route-stops", {
        where: { route: { equals: (routeData as any).id } },
        sort: "stopOrder",
        limit: 200,
      });
      const stopsData = stopsRes.docs;

      const normalizedStops = (stopsData || []).map((stop: any) => {
        const blocks = Array.isArray(stop.contentBlocks)
          ? stop.contentBlocks
          : [];

        return {
          id: String(stop.id),
          route_id: String(stop.route || normalizedRoute.id),
          title: stop.title || stop.name || "Stop",
          description: stop.description || null,
          latitude: stop.latitude || 0,
          longitude: stop.longitude || 0,
          stop_order: stop.stopOrder || stop.orderIndex || 1,
          estimated_time_minutes:
            stop.estimatedTimeMinutes || stop.estimated_time_minutes || 15,
          autoplay_on_arrival: !!stop.autoplayOnArrival,
          marker_color: stop.markerColor || "#F97316",
          marker_icon: stop.markerIcon || "location",
          linked_story_id: null,
          linked_testimony_id: null,
          content_blocks: blocks.map((block: any, index: number) => ({
            id: String(block.id || `${stop.id}-block-${index}`),
            stop_id: String(stop.id),
            block_type: block.blockType || "text",
            block_order: block.blockOrder || index,
            content: block.content || {},
          })),
        } as RouteStop;
      });

      setStops(normalizedStops);
      setLoading(false);
    };

    fetchRoute();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading route...</p>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Route not found</p>
      </div>
    );
  }

  const stopPath: [number, number][] = stops
    .filter(
      (stop) =>
        Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude),
    )
    .sort((a, b) => a.stop_order - b.stop_order)
    .map((stop) => [stop.latitude, stop.longitude]);

  const mapPath = routePath.length > 1 ? routePath : stopPath;

  const mapCenter: [number, number] =
    mapPath[0] || stopPath[0] || ([-1.9403, 29.8739] as [number, number]);

  const travelSpanLabel =
    stops.length >= 2
      ? `${stops[0].title} -> ${stops[stops.length - 1].title}`
      : null;

  const routeGalleryImages = (() => {
    const fromStops = getImageUrlsFromStops(stops);
    const all = [route.cover_image, ...fromStops].filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    );

    const unique = Array.from(new Set(all));
    if (unique.length >= 2) return unique.slice(0, 4);

    return Array.from(
      new Set([...unique, ...TEMP_ROUTE_GALLERY_FALLBACK]),
    ).slice(0, 4);
  })();

  const handleStartRoute = () => {
    if (stops.length > 0) {
      setActiveStop(stops[0]);
      return;
    }

    toast({
      title: "No stops yet",
      description: "This route has no stops configured yet.",
    });
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Easy";
      case "moderate":
        return "Moderate";
      case "challenging":
        return "Challenging";
      default:
        return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Cover */}
      <div className="relative h-56 sm:h-72 md:h-80 lg:h-96">
        {route.cover_image ? (
          <img
            src={route.cover_image}
            alt={route.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber to-terracotta" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-midnight" />
        </button>

        {/* Route info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
          <h1 className="font-serif text-2xl font-semibold text-white mb-2">
            {route.title}
          </h1>
          {route.description && (
            <p className="text-white/80 text-sm mb-4">{route.description}</p>
          )}

          <div className="flex items-center gap-4 text-white/70 text-sm flex-wrap">
            {route.duration_minutes && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {route.duration_minutes} min
              </div>
            )}
            {route.distance_km && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {route.distance_km} km
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber rounded-full" />
              {stops.length} stops
            </div>
            <div className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {getDifficultyLabel(route.difficulty)}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 -mt-6 relative z-10">
        <Button size="lg" className="w-full" onClick={handleStartRoute}>
          <Play className="w-5 h-5 mr-2" />
          {stops.length > 0 ? "Start Route" : "Start Route (No Stops Yet)"}
        </Button>
      </div>

      {travelSpanLabel && (
        <div className="px-4 mt-4">
          <div className="rounded-xl bg-muted/30 border border-border/60 p-3 text-sm text-muted-foreground">
            Journey:{" "}
            <span className="text-foreground font-medium">
              {travelSpanLabel}
            </span>
          </div>
        </div>
      )}

      {(mapPath.length > 1 || stops.length > 0) && (
        <div className="px-4 mt-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">
            Route Map
          </h2>
          <div className="rounded-2xl overflow-hidden border border-border/60 bg-muted/10">
            <MapContainer
              center={mapCenter}
              zoom={10}
              style={{ height: 240, width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapPath.length > 1 && (
                <Polyline
                  positions={mapPath}
                  pathOptions={{ color: "#0f766e", weight: 4, opacity: 0.85 }}
                />
              )}

              {stops.map((stop) => (
                <Marker
                  key={stop.id}
                  position={[stop.latitude, stop.longitude]}
                  icon={routeStopIcon}
                />
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {routeGalleryImages.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">
            Route Highlights
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {routeGalleryImages.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="rounded-xl overflow-hidden bg-muted/40"
              >
                <img
                  src={imageUrl}
                  alt={`${route.title} highlight ${index + 1}`}
                  className="h-28 sm:h-36 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini Map Strip */}
      {stops.length > 1 && (
        <div className="px-4 mt-8">
          <div className="relative bg-muted/50 rounded-2xl p-4">
            <div className="flex items-center justify-between relative">
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-muted-foreground/20" />
              {stops.map((stop) => (
                <div
                  key={stop.id}
                  className={cn(
                    "relative z-10 w-4 h-4 rounded-full transition-all",
                    activeStop?.id === stop.id
                      ? "w-5 h-5 bg-amber ring-4 ring-amber/30"
                      : themeColors[stop.marker_icon] || "bg-amber",
                  )}
                  style={{
                    backgroundColor:
                      activeStop?.id === stop.id
                        ? undefined
                        : stop.marker_color,
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => navigate(`/map?route=${route.slug}`)}
              className="flex items-center justify-center gap-2 w-full mt-4 text-amber text-sm font-medium hover:text-amber/80 transition-colors"
            >
              Open Full Map
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Route Stops */}
      <div className="px-4 mt-8 pb-8">
        <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
          Route Stops
        </h2>

        {stops.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No stops added to this route yet.
          </p>
        ) : (
          <div className="space-y-3">
            {stops.map((stop, idx) => (
              <button
                key={stop.id}
                onClick={() => setActiveStop(stop)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                  "bg-muted/30 hover:bg-muted/50",
                  activeStop?.id === stop.id && "ring-2 ring-amber bg-amber/10",
                )}
              >
                {/* Stop number */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                  style={{ backgroundColor: stop.marker_color }}
                >
                  {idx + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">
                    {stop.title}
                  </h3>
                  {stop.description && (
                    <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                      {stop.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {stop.estimated_time_minutes} min
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stop Detail Sheet - Could be expanded */}
      {activeStop && (
        <StopDetailSheet
          stop={activeStop}
          onClose={() => setActiveStop(null)}
        />
      )}
    </div>
  );
}

function StopDetailSheet({
  stop,
  onClose,
}: {
  stop: RouteStop;
  onClose: () => void;
}) {
  const [blocks, setBlocks] = useState<StopContentBlock[]>([]);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const blocksRes = await api.find("stop-content-blocks", {
          where: { stop: { equals: stop.id } },
          sort: "blockOrder",
          limit: 100,
        });
        setBlocks((blocksRes.docs || []) as unknown as StopContentBlock[]);
      } catch {
        setBlocks([]);
      }
    };

    fetchBlocks();
  }, [stop.id]);

  return (
    <div className="fixed inset-x-0 bottom-0 bg-background border-t rounded-t-3xl shadow-xl max-h-[60vh] overflow-y-auto animate-in slide-in-from-bottom sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-2xl sm:w-full">
      <div className="p-4">
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl font-semibold">{stop.title}</h3>
            {stop.description && (
              <p className="text-muted-foreground text-sm mt-1">
                {stop.description}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Render content blocks */}
        <div className="space-y-4">
          {blocks.map((block) => (
            <ContentBlockRenderer key={block.id} block={block} />
          ))}
        </div>

        {blocks.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No additional content for this stop.
          </p>
        )}
      </div>
    </div>
  );
}

function ContentBlockRenderer({ block }: { block: StopContentBlock }) {
  const content = block.content as unknown as Record<string, unknown>;

  switch (block.block_type) {
    case "text":
      return (
        <div className="prose prose-sm max-w-none">
          <p>{content.text as string}</p>
        </div>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-amber pl-4 italic">
          <p className="text-foreground">"{content.quote as string}"</p>
          {content.attribution && (
            <footer className="text-sm text-muted-foreground mt-2">
              — {content.attribution as string}
              {content.year && `, ${content.year}`}
            </footer>
          )}
        </blockquote>
      );

    case "fact":
      return (
        <div className="bg-amber/10 rounded-xl p-4">
          <p className="font-semibold text-amber text-sm mb-1">
            {(content.title as string) || "Did you know?"}
          </p>
          <p className="text-foreground text-sm">{content.fact as string}</p>
        </div>
      );

    case "image":
      const images =
        (content.images as { url: string; caption?: string }[]) || [];
      return (
        <div className="space-y-2">
          {images.map((img, idx) => (
            <div key={idx}>
              <img
                src={img.url}
                alt={img.caption || "Stop image"}
                className="rounded-xl w-full"
              />
              {img.caption && (
                <p className="text-xs text-muted-foreground mt-1">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      );

    case "video":
      return (
        <div className="rounded-xl overflow-hidden media-container">
          <video
            src={content.url as string}
            controls
            className="w-full aspect-video"
            poster={content.thumbnail as string}
            playsInline
          />
          {content.caption && (
            <p className="text-xs text-muted-foreground mt-1">
              {content.caption as string}
            </p>
          )}
        </div>
      );

    case "audio":
      return (
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="font-medium text-sm mb-2">
            {(content.title as string) || "Audio"}
          </p>
          <audio
            src={content.url as string}
            controls
            className="w-full max-w-full"
          />
          {content.transcript && (
            <details className="mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer">
                Show transcript
              </summary>
              <p className="text-xs mt-2">{content.transcript as string}</p>
            </details>
          )}
        </div>
      );

    default:
      return null;
  }
}
