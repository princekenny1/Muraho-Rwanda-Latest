import { useState, useMemo, useEffect } from "react";
import { X, Search, Navigation, LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PinTheme, EmotionalTone } from "@/components/map/CinematicMapPin";
import {
  StoryPreviewSheet,
  StoryMode,
} from "@/components/map/StoryPreviewSheet";
import {
  NightModeMapOverlay,
  useTimeOfDay,
} from "@/components/ambient/TimeOfDayMode";
import {
  WeatherMapOverlay,
  useWeather,
} from "@/components/ambient/WeatherTriggeredStories";
import {
  useAllMapPoints,
  useUserLocation,
  RWANDA_CENTER,
  type MapPoint,
} from "@/hooks/useMapData";

interface FullMapProps {
  onClose?: () => void;
  onStoryClick?: (storyId: string) => void;
}

interface MapStory {
  id: string;
  lat: number;
  lng: number;
  title: string;
  theme: PinTheme;
  emotionalTone?: EmotionalTone;
  type: string;
  coverImage: string;
  duration: string;
  description: string;
  hasThenNow: boolean;
  distance?: string;
  popularity?: number;
  hasUnheardStory?: boolean;
}

const themeLabels: Record<PinTheme, { label: string; color: string }> = {
  remembrance: { label: "Remembrance", color: "#4B5573" },
  culture: { label: "Culture", color: "#C46A4A" },
  travel: { label: "Travel", color: "#70C1A5" },
  museum: { label: "Museums", color: "#2C6E6F" },
};

// ── Map point → theme mapping ────────────────────────────
const typeToTheme: Record<string, PinTheme> = {
  museum: "museum",
  location: "travel",
  route_stop: "travel",
  outdoor_stop: "remembrance",
  story: "culture",
};
const typeToFilter: Record<string, string> = {
  museum: "museum",
  outdoor_stop: "memorial",
  route_stop: "landmark",
  location: "story",
};

function mapPointToStory(p: MapPoint): MapStory {
  return {
    id: p.id,
    lat: p.latitude,
    lng: p.longitude,
    title: p.title,
    theme: typeToTheme[p.type] || "travel",
    emotionalTone: p.type === "outdoor_stop" ? "intense" : "inspiring",
    type: typeToFilter[p.type] || p.type,
    coverImage: p.imageUrl || "",
    duration: p.distanceKm ? `${p.distanceKm.toFixed(1)} km` : "",
    description: "",
    hasThenNow: false,
    distance: p.distanceKm ? `${p.distanceKm.toFixed(1)} km` : undefined,
    popularity: 50,
  };
}

const filters = [
  { id: "all", label: "All" },
  { id: "memorial", label: "Memorials" },
  { id: "museum", label: "Museums" },
  { id: "story", label: "Stories" },
  { id: "landmark", label: "Landmarks" },
];

const markerIcon = L.divIcon({
  className: "muraho-map-pin",
  html: '<div style="width:14px;height:14px;background:#f59e0b;border:2px solid white;border-radius:9999px;box-shadow:0 0 0 2px rgba(245,158,11,0.25)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapFlyController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.9 });
  }, [center, zoom, map]);

  return null;
}

function routeToLatLng(path: any): [number, number][] {
  if (!path) return [];

  const lineString = (coords: any[]): [number, number][] =>
    coords
      .filter((c) => Array.isArray(c) && c.length >= 2)
      .map((c) => [Number(c[1]), Number(c[0])])
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

  if (path.type === "LineString" && Array.isArray(path.coordinates)) {
    return lineString(path.coordinates);
  }

  if (path.type === "Feature" && path.geometry?.type === "LineString") {
    return lineString(path.geometry.coordinates || []);
  }

  if (path.type === "MultiLineString" && Array.isArray(path.coordinates)) {
    return path.coordinates.flatMap((segment: any[]) => lineString(segment));
  }

  return [];
}

export function FullMap({ onClose, onStoryClick }: FullMapProps) {
  // ── Live data from spatial API ───────────────────────────
  const { points: mapPoints, routeLines, isLoading } = useAllMapPoints();
  const { data: userLocation } = useUserLocation();

  const livePins: MapStory[] = useMemo(
    () => mapPoints.map(mapPointToStory),
    [mapPoints],
  );

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPin, setSelectedPin] = useState<MapStory | null>(null);
  const [playingStoryId, setPlayingStoryId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    RWANDA_CENTER.latitude,
    RWANDA_CENTER.longitude,
  ]);
  const [mapZoom, setMapZoom] = useState(8);
  const [isSearching, setIsSearching] = useState(false);

  const { isNightMode } = useTimeOfDay();
  const { weather } = useWeather();

  const defaultOnClose = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };
  const safeOnClose = onClose || defaultOnClose;
  const safeOnStoryClick = onStoryClick || (() => undefined);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredPins = livePins.filter((pin) => {
    const matchesFilter =
      activeFilter === "all" ? true : pin.type === activeFilter;
    const matchesSearch =
      !normalizedSearchQuery ||
      pin.title.toLowerCase().includes(normalizedSearchQuery);
    return matchesFilter && matchesSearch;
  });

  const handlePinClick = (id: string) => {
    const pin = livePins.find((p) => p.id === id);
    if (pin) {
      setSelectedPin(pin);
      setMapCenter([pin.lat, pin.lng]);
      setMapZoom(15);
    }
  };

  const handlePlay = (storyId: string, mode: StoryMode) => {
    console.log(`Playing story ${storyId} in ${mode} mode`);
    setPlayingStoryId(storyId);
    safeOnStoryClick(storyId);
  };

  const handleOpenStory = (storyId: string) => {
    safeOnStoryClick(storyId);
  };

  const visibleRouteSegments = useMemo(
    () =>
      routeLines
        .map((line) => routeToLatLng(line.path))
        .filter((coords) => coords.length > 1),
    [routeLines],
  );

  const handleSearch = async () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const exactPin = livePins.find((p) =>
      p.title.toLowerCase().includes(query),
    );
    if (exactPin) {
      handlePinClick(exactPin.id);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${searchQuery}, Rwanda`)}&limit=1`,
      );
      const results = await response.json();
      if (Array.isArray(results) && results.length > 0) {
        const lat = Number(results[0].lat);
        const lng = Number(results[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setMapCenter([lat, lng]);
          setMapZoom(14);
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const nextCenter: [number, number] = [
        position.coords.latitude,
        position.coords.longitude,
      ];
      setMapCenter(nextCenter);
      setMapZoom(14);
    });
  };

  const handleNavigate = (pin: MapStory) => {
    const destination = `${pin.lat},${pin.lng}`;
    const origin = userLocation
      ? `&origin=${userLocation.latitude},${userLocation.longitude}`
      : "";
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}${origin}&travelmode=walking`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-colors duration-500",
        isNightMode ? "bg-midnight" : "bg-background",
      )}
    >
      {/* Map container */}
      <div className="absolute inset-0">
        <MapContainer
          center={[RWANDA_CENTER.latitude, RWANDA_CENTER.longitude]}
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFlyController center={mapCenter} zoom={mapZoom} />

          {visibleRouteSegments.map((coords, index) => (
            <Polyline
              key={`route-segment-${index}`}
              positions={coords}
              pathOptions={{ color: "#0f766e", weight: 4, opacity: 0.85 }}
            />
          ))}

          {filteredPins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => handlePinClick(pin.id),
              }}
            >
              <Popup>
                <div className="space-y-2 min-w-[170px]">
                  <p className="font-medium text-sm">{pin.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {pin.type.replace("_", " ")}
                  </p>
                  <button
                    className="w-full rounded-md bg-amber px-2 py-1 text-xs font-medium text-midnight"
                    onClick={() => handleNavigate(pin)}
                  >
                    Navigate
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <NightModeMapOverlay />
        <WeatherMapOverlay />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 safe-area-top z-20">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onClose}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors",
              isNightMode
                ? "bg-midnight/80 backdrop-blur-sm border border-white/10"
                : "bg-white",
            )}
          >
            <X
              className={cn(
                "w-5 h-5",
                isNightMode ? "text-white" : "text-foreground",
              )}
            />
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search locations..."
              className={cn(
                "w-full h-10 pl-10 pr-4 rounded-full text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-amber",
                isNightMode
                  ? "bg-midnight/80 backdrop-blur-sm border border-white/10 text-white placeholder:text-white/50"
                  : "bg-white",
              )}
            />
          </div>

          <button
            onClick={handleSearch}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors",
              isNightMode
                ? "bg-midnight/80 backdrop-blur-sm border border-white/10"
                : "bg-white",
            )}
            title="Search"
          >
            <Search
              className={cn(
                "w-5 h-5",
                isNightMode ? "text-white" : "text-foreground",
              )}
            />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shadow-sm",
                  activeFilter === filter.id
                    ? "bg-amber text-midnight"
                    : isNightMode
                      ? "bg-midnight/60 backdrop-blur-sm border border-white/10 text-white/80 hover:bg-midnight/80"
                      : "bg-white text-muted-foreground hover:bg-white/90",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating action buttons */}
      <div className="absolute right-4 bottom-44 z-20 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          className="w-12 h-12 bg-amber rounded-full flex items-center justify-center shadow-lg hover:bg-sunset-gold transition-colors"
          style={{ boxShadow: "0 4px 20px rgba(255, 184, 92, 0.4)" }}
          title="Center on my location"
        >
          <LocateFixed className="w-5 h-5 text-midnight" />
        </button>
      </div>

      {isSearching && (
        <div className="absolute top-28 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
          Searching...
        </div>
      )}

      {/* Story Preview Sheet */}
      <StoryPreviewSheet
        story={
          selectedPin
            ? {
                id: selectedPin.id,
                title: selectedPin.title,
                coverImage: selectedPin.coverImage,
                duration: selectedPin.duration,
                theme: themeLabels[selectedPin.theme].label,
                themeColor: themeLabels[selectedPin.theme].color,
                description: selectedPin.description,
                hasThenNow: selectedPin.hasThenNow,
                distance: selectedPin.distance,
              }
            : null
        }
        isOpen={!!selectedPin}
        onClose={() => setSelectedPin(null)}
        onPlay={handlePlay}
        onOpenStory={handleOpenStory}
        onSave={(id) => console.log("Saved:", id)}
        onAddToRoute={(id) => console.log("Add to route:", id)}
      />
    </div>
  );
}
