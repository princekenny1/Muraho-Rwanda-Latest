import { useState, useEffect, useMemo } from "react";
import { X, Search, Layers, Navigation, List } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CinematicMapPin,
  PinTheme,
  EmotionalTone,
} from "@/components/map/CinematicMapPin";
import { RouteHeatmap, RouteSegment } from "@/components/map/RouteHeatmap";
import {
  StoryPreviewSheet,
  StoryMode,
} from "@/components/map/StoryPreviewSheet";
import { OnRoadNotification } from "@/components/notifications/OnRoadNotification";
import { NotificationQueue } from "@/components/notifications/NotificationQueue";
import { NotificationBundle } from "@/components/notifications/NotificationBundle";
import { LandscapeSpeaksMode } from "@/components/ambient/LandscapeSpeaksMode";
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
  type MapPoint,
} from "@/hooks/useMapData";

interface FullMapProps {
  onClose: () => void;
  onStoryClick: (storyId: string) => void;
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

// Live data loaded via useAllMapPoints() hook — see below

// Route heatmap data loaded via useAllMapPoints().routeLines

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
  const [nearbyPin, setNearbyPin] = useState<string | null>(null);
  const [playingStoryId, setPlayingStoryId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showBundle, setShowBundle] = useState(false);
  const [snoozedStories, setSnoozedStories] = useState<string[]>([]);
  const [landscapeSpeaksEnabled, setLandscapeSpeaksEnabled] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState<
    "emotional" | "popularity" | "duration"
  >("emotional");

  const { isNightMode } = useTimeOfDay();
  const { weather } = useWeather();

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
    }
  };

  const handlePlay = (storyId: string, mode: StoryMode) => {
    console.log(`Playing story ${storyId} in ${mode} mode`);
    setPlayingStoryId(storyId);
    onStoryClick(storyId);
  };

  const handleOpenStory = (storyId: string) => {
    onStoryClick(storyId);
  };

  // Mock queue data
  const queueStories = livePins.map((pin, index) => ({
    id: pin.id,
    title: pin.title,
    coverImage: pin.coverImage,
    duration: pin.duration,
    distance: pin.distance || "1 km",
    isPlayed: index < 1,
    isCurrent: index === 1,
  }));

  // Bundle stories for nearby area
  const bundleStories = livePins.slice(0, 4).map((pin) => ({
    id: pin.id,
    title: pin.title,
    coverImage: pin.coverImage,
    duration: pin.duration,
    theme: themeLabels[pin.theme].label,
    themeColor: themeLabels[pin.theme].color,
    distance: pin.distance || "1 km",
    emotionalTone: pin.emotionalTone,
  }));

  // Demo notification after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!snoozedStories.includes("1")) {
        // Show bundle if multiple stories nearby
        if (
          livePins.filter((p) => p.distance && parseFloat(p.distance) < 1.5)
            .length > 2
        ) {
          setShowBundle(true);
        } else {
          setShowNotification(true);
        }
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [snoozedStories]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-colors duration-500",
        isNightMode ? "bg-midnight" : "bg-background",
      )}
    >
      {/* Map container */}
      <div className="absolute inset-0">
        {/* Simulated map with gradient background */}
        <div className="relative w-full h-full">
          {/* Map background with topographic styling */}
          <div
            className={cn(
              "absolute inset-0 transition-colors duration-500",
              isNightMode
                ? "bg-gradient-to-br from-midnight via-muted-indigo/20 to-midnight"
                : "bg-gradient-to-br from-sky-blue/20 via-cloud-mist to-adventure-green/10",
            )}
          >
            {/* Grid pattern */}
            <svg
              className="absolute inset-0 w-full h-full opacity-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="48"
                  height="48"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 48 0 L 0 0 0 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className={isNightMode ? "text-white" : "text-midnight"}
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Route Heatmap */}
            <RouteHeatmap
              segments={[]}
              mode={heatmapMode}
              showLabels={true}
              animated={true}
              className="absolute inset-0"
            />
          </div>

          {/* Night mode overlay with stars */}
          <NightModeMapOverlay />

          {/* Weather overlay */}
          <WeatherMapOverlay />

          {/* Map placeholder message */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={cn(
                "text-center",
                isNightMode ? "text-white/30" : "text-muted-foreground/50",
              )}
            >
              <Navigation className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Interactive Map</p>
              <p className="text-xs mt-1">Tap pins to explore stories</p>
            </div>
          </div>

          {/* Cinematic Map pins */}
          {filteredPins.map((pin, idx) => (
            <CinematicMapPin
              key={`${pin.id}-${idx}`}
              id={pin.id}
              theme={pin.theme}
              title={pin.title}
              emotionalTone={pin.emotionalTone}
              isSelected={selectedPin?.id === pin.id}
              isNearby={nearbyPin === pin.id && selectedPin?.id !== pin.id}
              isPlaying={playingStoryId === pin.id}
              popularity={pin.popularity}
              hasUnheardStory={pin.hasUnheardStory}
              onClick={handlePinClick}
              style={{
                left: `${18 + idx * 16}%`,
                top: `${25 + (idx % 4) * 15}%`,
              }}
            />
          ))}
        </div>
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
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors",
              isNightMode
                ? "bg-midnight/80 backdrop-blur-sm border border-white/10"
                : "bg-white",
            )}
          >
            <Layers
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

        {/* Heatmap mode toggle */}
        <div className="px-4 pb-2">
          <div className="flex gap-2">
            {(["emotional", "popularity", "duration"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setHeatmapMode(mode)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize",
                  heatmapMode === mode
                    ? "bg-adventure-green text-white"
                    : isNightMode
                      ? "bg-midnight/40 text-white/60"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Landscape Speaks Mode toggle */}
      <div className="absolute top-32 left-4 z-20">
        <LandscapeSpeaksMode
          isEnabled={landscapeSpeaksEnabled}
          onToggle={setLandscapeSpeaksEnabled}
        />
      </div>

      {/* Floating action buttons */}
      <div className="absolute right-4 bottom-48 z-20 flex flex-col gap-2">
        {/* Queue button */}
        <button
          onClick={() => setShowQueue(true)}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors relative",
            isNightMode
              ? "bg-midnight/80 backdrop-blur-sm border border-white/10 hover:bg-midnight"
              : "bg-white hover:bg-muted",
          )}
        >
          <List
            className={cn(
              "w-5 h-5",
              isNightMode ? "text-white" : "text-foreground",
            )}
          />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber text-midnight text-xs font-bold rounded-full flex items-center justify-center">
            {livePins.length}
          </span>
        </button>

        {/* Near Me Button */}
        <button
          className="w-12 h-12 bg-amber rounded-full flex items-center justify-center shadow-lg hover:bg-sunset-gold transition-colors"
          style={{ boxShadow: "0 4px 20px rgba(255, 184, 92, 0.4)" }}
        >
          <Navigation className="w-5 h-5 text-midnight" />
        </button>
      </div>

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

      {/* On-Road Notification (legacy) */}
      <OnRoadNotification
        story={{
          id: "1",
          title: "Kigali Genocide Memorial",
          duration: "3 min",
          teaser: "What stood here in 1994, and what stands today?",
          hasThenNow: true,
          theme: "Remembrance",
          themeColor: "#4B5573",
        }}
        isVisible={showNotification && !selectedPin && !showBundle}
        onPlayNow={(id) => {
          setShowNotification(false);
          onStoryClick(id);
        }}
        onPreview={(id) => {
          setShowNotification(false);
          handlePinClick(id);
        }}
        onSnooze={(id, option) => {
          setSnoozedStories([...snoozedStories, id]);
          setShowNotification(false);
          console.log(`Snoozed ${id} with option: ${option}`);
        }}
        onDismiss={() => setShowNotification(false)}
        autoDismissDelay={30000}
      />

      {/* Notification Bundle (multiple nearby stories) */}
      <NotificationBundle
        stories={bundleStories}
        areaName="Kigali City Center"
        isOpen={showBundle && !selectedPin}
        onClose={() => setShowBundle(false)}
        onPlayStory={(id) => {
          setShowBundle(false);
          handlePinClick(id);
        }}
        onPlayAll={() => {
          setShowBundle(false);
          if (bundleStories.length > 0) {
            onStoryClick(bundleStories[0].id);
          }
        }}
      />

      {/* Notification Queue */}
      <NotificationQueue
        stories={queueStories}
        isOpen={showQueue}
        onClose={() => setShowQueue(false)}
        onPlayStory={(id) => {
          setShowQueue(false);
          onStoryClick(id);
        }}
        onRemoveFromQueue={(id) => console.log("Remove from queue:", id)}
      />
    </div>
  );
}
