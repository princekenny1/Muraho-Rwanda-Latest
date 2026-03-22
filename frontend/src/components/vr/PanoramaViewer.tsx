import { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Play,
  Pause,
  Volume2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VRHotspotPin, HotspotType } from "./VRHotspotPin";
import { VRHotspotSheet, HotspotContent } from "./VRHotspotSheet";
import { VRControls } from "./VRControls";
import {
  useVRScenes,
  useVRHotspots,
  VRScene,
  VRHotspot,
} from "@/hooks/useVRScenes";
import kctPost from "@/assets/KCT-Post.jpg";
import kwaRubangura from "@/assets/kwa_rubangura.jpg";

interface Hotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  description?: string;
  audioUrl?: string;
  imageUrl?: string;
  duration?: number;
  type: HotspotType;
  targetSceneId?: string;
}

interface Scene {
  id: string;
  title: string;
  imageUrl: string;
  hotspots: Hotspot[];
  narrationText?: string;
}

interface PanoramaViewerProps {
  museumId?: string;
  scenes?: Scene[];
  initialSceneId?: string;
  isGuidedMode?: boolean;
  onClose: () => void;
  onHotspotClick?: (hotspot: Hotspot) => void;
}

// Fallback mock scenes when no database data
const fallbackScenes: Scene[] = [
  {
    id: "entrance",
    title: "Memorial Entrance",
    imageUrl: kctPost,
    narrationText:
      "Welcome to the Kigali Genocide Memorial. This sacred space serves as the final resting place for more than 250,000 victims.",
    hotspots: [
      {
        id: "1",
        x: 30,
        y: 50,
        title: "Main Gate",
        description: "The entrance to the memorial grounds.",
        type: "info",
      },
      {
        id: "2",
        x: 60,
        y: 45,
        title: "Audio Guide",
        description: "Begin your audio-guided journey.",
        duration: 180,
        type: "audio",
      },
      { id: "3", x: 85, y: 55, title: "Memorial Gardens", type: "next-scene" },
    ],
  },
  {
    id: "gardens",
    title: "Memorial Gardens",
    imageUrl: kwaRubangura,
    narrationText:
      "The Memorial Gardens offer a peaceful space for reflection and remembrance.",
    hotspots: [
      {
        id: "4",
        x: 25,
        y: 60,
        title: "Rose Garden",
        description: "Each rose represents a life lost.",
        type: "landmark",
      },
      { id: "5", x: 15, y: 50, title: "Memorial Entrance", type: "next-scene" },
    ],
  },
];

// Convert database VRHotspot to component Hotspot format
function mapDatabaseHotspot(dbHotspot: VRHotspot): Hotspot {
  return {
    id: dbHotspot.id,
    x: dbHotspot.position_x,
    y: dbHotspot.position_y,
    title: dbHotspot.title,
    description: dbHotspot.description || undefined,
    audioUrl: dbHotspot.content?.audioUrl,
    duration: dbHotspot.content?.duration,
    type: dbHotspot.type,
    targetSceneId: dbHotspot.target_scene_id || undefined,
  };
}

export function PanoramaViewer({
  museumId = "kgm",
  scenes: propScenes,
  initialSceneId,
  isGuidedMode = false,
  onClose,
  onHotspotClick,
}: PanoramaViewerProps) {
  // Fetch scenes from database
  const { data: dbScenes, isLoading: scenesLoading } = useVRScenes(museumId);

  // Track which scene we need hotspots for
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loadedHotspots, setLoadedHotspots] = useState<
    Record<string, Hotspot[]>
  >({});

  // Determine which scenes to use (database or props or fallback)
  const baseScenes: Scene[] = useMemo(() => {
    if (propScenes && propScenes.length > 0) {
      return propScenes;
    }
    if (dbScenes && dbScenes.length > 0) {
      return dbScenes.map((dbScene) => ({
        id: dbScene.id,
        title: dbScene.title,
        imageUrl: dbScene.panorama_url,
        narrationText: dbScene.narration_text || undefined,
        hotspots: [], // Will be loaded separately
      }));
    }
    return fallbackScenes;
  }, [propScenes, dbScenes]);

  // Current scene ID for hotspot fetching
  const currentSceneId = baseScenes[currentSceneIndex]?.id;

  // Fetch hotspots for current scene
  const { data: dbHotspots } = useVRHotspots(
    propScenes ? undefined : currentSceneId, // Only fetch if using database scenes
  );

  // Merge hotspots into scenes
  const scenes: Scene[] = useMemo(() => {
    return baseScenes.map((scene) => {
      // If we have database hotspots for this scene
      if (dbHotspots && scene.id === currentSceneId && !propScenes) {
        return {
          ...scene,
          hotspots: dbHotspots.map(mapDatabaseHotspot),
        };
      }
      // If we have cached hotspots
      if (loadedHotspots[scene.id]) {
        return {
          ...scene,
          hotspots: loadedHotspots[scene.id],
        };
      }
      return scene;
    });
  }, [baseScenes, dbHotspots, currentSceneId, loadedHotspots, propScenes]);

  // Cache hotspots when loaded
  useEffect(() => {
    if (dbHotspots && currentSceneId && !propScenes) {
      setLoadedHotspots((prev) => ({
        ...prev,
        [currentSceneId]: dbHotspots.map(mapDatabaseHotspot),
      }));
    }
  }, [dbHotspots, currentSceneId, propScenes]);

  // Set initial scene index when scenes load
  useEffect(() => {
    if (initialSceneId && scenes.length > 0) {
      const idx = scenes.findIndex((s) => s.id === initialSceneId);
      if (idx >= 0) setCurrentSceneIndex(idx);
    }
  }, [initialSceneId, scenes.length]);

  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [rotation, setRotation] = useState(0);
  const [guidedMode, setGuidedMode] = useState(isGuidedMode);
  const [isPlaying, setIsPlaying] = useState(isGuidedMode);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQuietMode, setIsQuietMode] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationProgress, setNarrationProgress] = useState(0);
  const [showNarrationText, setShowNarrationText] = useState(true);
  const [showHotspotSheet, setShowHotspotSheet] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const narrationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Current scene derived from scenes array
  const currentScene = scenes[currentSceneIndex];

  // Start narration when scene changes in guided mode
  useEffect(() => {
    if (guidedMode && isPlaying && !isQuietMode && currentScene) {
      startNarration();
    }

    return () => {
      if (narrationTimerRef.current) {
        clearInterval(narrationTimerRef.current);
      }
    };
  }, [currentSceneIndex, guidedMode, isPlaying, isQuietMode]);

  // Auto-advance in guided mode (every 8 seconds after narration)
  useEffect(() => {
    if (!guidedMode || !isPlaying || !currentScene) return;

    const timer = setTimeout(() => {
      if (currentSceneIndex < scenes.length - 1) {
        setCurrentSceneIndex((prev) => prev + 1);
        setRotation(0);
      } else {
        setIsPlaying(false);
        stopNarration();
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [currentSceneIndex, isPlaying, guidedMode, scenes.length]);

  // Narration simulation helpers
  const startNarration = () => {
    if (isMuted || isQuietMode) return;

    setIsNarrating(true);
    setNarrationProgress(0);
    setShowNarrationText(true);

    const duration = 6000;
    const interval = 100;
    let elapsed = 0;

    if (narrationTimerRef.current) {
      clearInterval(narrationTimerRef.current);
    }

    narrationTimerRef.current = setInterval(() => {
      elapsed += interval;
      setNarrationProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        if (narrationTimerRef.current) {
          clearInterval(narrationTimerRef.current);
        }
        setIsNarrating(false);
      }
    }, interval);
  };

  const stopNarration = () => {
    if (narrationTimerRef.current) {
      clearInterval(narrationTimerRef.current);
    }
    setIsNarrating(false);
    setNarrationProgress(0);
  };

  // Show loading state while fetching scenes
  if (scenesLoading && !propScenes) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading virtual tour...</p>
        </div>
      </div>
    );
  }

  if (!currentScene) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70">No scenes available</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-amber text-midnight rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Reset view handler
  const handleResetView = () => {
    setRotation(0);
  };

  // Handle mouse/touch drag for rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastX.current;
    setRotation((prev) => prev + deltaX * 0.3);
    lastX.current = e.clientX;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    lastX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.touches[0].clientX - lastX.current;
    setRotation((prev) => prev + deltaX * 0.3);
    lastX.current = e.touches[0].clientX;
  };

  const goToScene = (sceneId: string) => {
    const index = scenes.findIndex((s) => s.id === sceneId);
    if (index >= 0) {
      setCurrentSceneIndex(index);
      setActiveHotspot(null);
      setShowHotspotSheet(false);
      setRotation(0);
    }
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (hotspot.type === "next-scene") {
      // Use target scene ID from database or fallback to title matching
      const targetId =
        hotspot.targetSceneId ||
        scenes.find((s) =>
          s.title
            .toLowerCase()
            .includes(
              hotspot.title
                .toLowerCase()
                .replace("continue to ", "")
                .replace("go to ", ""),
            ),
        )?.id ||
        scenes[0]?.id;
      if (targetId) goToScene(targetId);
    } else if (!guidedMode) {
      // In Free Explore mode, open bottom sheet
      setActiveHotspot(activeHotspot?.id === hotspot.id ? null : hotspot);
      setShowHotspotSheet(activeHotspot?.id !== hotspot.id);
      onHotspotClick?.(hotspot);
    } else {
      // In Guided mode, just highlight
      setActiveHotspot(activeHotspot?.id === hotspot.id ? null : hotspot);
      onHotspotClick?.(hotspot);
    }
  };

  const handleCloseHotspotSheet = () => {
    setShowHotspotSheet(false);
    setActiveHotspot(null);
  };

  const handleNavigateFromSheet = (hotspotId: string) => {
    if (activeHotspot?.type === "next-scene") {
      // Use target scene ID from database or fallback to title matching
      const targetId =
        activeHotspot.targetSceneId ||
        (activeHotspot.title.includes("Entrance")
          ? scenes.find((s) => s.title.includes("Entrance"))?.id
          : activeHotspot.title.includes("Gardens")
            ? scenes.find((s) => s.title.includes("Gardens"))?.id
            : scenes[0]?.id);
      if (targetId) goToScene(targetId);
    }
  };

  // Toggle guided mode
  const handleModeToggle = () => {
    setGuidedMode(!guidedMode);
    setShowHotspotSheet(false);
    setActiveHotspot(null);

    if (!guidedMode) {
      setIsPlaying(true);
      startNarration();
    } else {
      setIsPlaying(false);
      stopNarration();
    }
  };

  // Convert hotspot to sheet content format
  const getHotspotContent = (
    hotspot: Hotspot | null,
  ): HotspotContent | null => {
    if (!hotspot) return null;
    return {
      id: hotspot.id,
      type: hotspot.type,
      title: hotspot.title,
      description: hotspot.description,
      audioUrl: hotspot.audioUrl,
      imageUrl: hotspot.imageUrl,
      duration: hotspot.duration,
    };
  };

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 z-50 bg-black", isFullscreen && "absolute")}
    >
      {/* Panorama container */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Simulated 360 view with transform */}
        <div
          className="absolute inset-0 transition-transform duration-100"
          style={{
            backgroundImage: `url(${currentScene.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: `${50 + rotation * 0.1}% center`,
            transform: `scale(1.2)`,
          }}
        />

        {/* Vignette overlay - reduced in quiet mode */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            isQuietMode
              ? "bg-gradient-to-t from-black/30 via-transparent to-black/20"
              : "bg-gradient-to-t from-black/60 via-transparent to-black/40",
          )}
        />

        {/* Hotspots - styled by type with 8s pulse */}
        {currentScene.hotspots.map((hotspot) => (
          <VRHotspotPin
            key={hotspot.id}
            id={hotspot.id}
            type={hotspot.type}
            title={hotspot.title}
            isActive={activeHotspot?.id === hotspot.id}
            isQuietMode={isQuietMode}
            onClick={() => handleHotspotClick(hotspot)}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
            }}
          />
        ))}

        {/* Narration overlay - guided mode only, hidden in quiet mode */}
        {guidedMode &&
          showNarrationText &&
          currentScene.narrationText &&
          !isQuietMode && (
            <div className="absolute top-20 left-4 right-4 z-20">
              <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full bg-amber flex items-center justify-center",
                      isNarrating && "animate-pulse",
                    )}
                  >
                    <Volume2 className="w-4 h-4 text-midnight" />
                  </div>
                  <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
                    {isNarrating ? "Narrating..." : "Narration Complete"}
                  </span>
                  {!isMuted && isNarrating && (
                    <div className="flex gap-0.5 ml-auto">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-amber rounded-full animate-pulse"
                          style={{
                            height: `${8 + i * 4}px`,
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Narration progress bar */}
                <div className="h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-amber transition-all duration-100 rounded-full"
                    style={{ width: `${narrationProgress}%` }}
                  />
                </div>

                {/* Narration text / captions */}
                <p className="text-white text-sm leading-relaxed">
                  {currentScene.narrationText}
                </p>

                <button
                  onClick={() => setShowNarrationText(false)}
                  className="mt-3 text-white/50 text-xs hover:text-white/80 transition-colors"
                >
                  Hide captions
                </button>
              </div>
            </div>
          )}

        {/* Show captions button when hidden */}
        {guidedMode &&
          !showNarrationText &&
          currentScene.narrationText &&
          !isQuietMode && (
            <button
              onClick={() => setShowNarrationText(true)}
              className="absolute top-20 left-4 z-20 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-lg text-white/70 text-xs hover:text-white transition-colors flex items-center gap-2"
            >
              <Volume2 className="w-3 h-3" />
              Show captions
            </button>
          )}
      </div>

      {/* Header controls with reset view and quiet mode */}
      <VRControls
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        isQuietMode={isQuietMode}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
        onQuietModeToggle={() => setIsQuietMode(!isQuietMode)}
        onResetView={handleResetView}
        onClose={onClose}
      />

      {/* Bottom sheet for Free Explore mode */}
      {!guidedMode && (
        <VRHotspotSheet
          hotspot={getHotspotContent(activeHotspot)}
          isOpen={showHotspotSheet}
          onClose={handleCloseHotspotSheet}
          onNavigate={handleNavigateFromSheet}
        />
      )}

      {/* Scene info & navigation - hidden when sheet is open */}
      {(!showHotspotSheet || guidedMode) && (
        <div className="absolute bottom-0 left-0 right-0 safe-area-bottom z-10">
          <div className="p-4">
            {/* Mode toggle */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-1 flex">
                <button
                  onClick={() => !guidedMode && handleModeToggle()}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    guidedMode
                      ? "bg-amber text-midnight"
                      : "text-white/70 hover:text-white",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4 fill-current" />
                    Guided Tour
                  </span>
                </button>
                <button
                  onClick={() => guidedMode && handleModeToggle()}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    !guidedMode
                      ? "bg-white text-midnight"
                      : "text-white/70 hover:text-white",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    Free Explore
                  </span>
                </button>
              </div>
            </div>

            {/* Scene title - minimal in quiet mode */}
            <div
              className={cn(
                "text-center mb-4 transition-opacity",
                isQuietMode && "opacity-60",
              )}
            >
              <h2 className="font-serif text-xl font-semibold text-white">
                {currentScene.title}
              </h2>
              {!isQuietMode && (
                <p className="text-sm text-white/70 mt-1">
                  {guidedMode
                    ? "Sit back and enjoy the narrated tour"
                    : "Drag to look around • Tap hotspots to explore"}
                </p>
              )}
            </div>

            {/* Scene navigation dots */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => goToScene(scene.id)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentSceneIndex
                      ? "bg-amber w-6"
                      : "bg-white/40 hover:bg-white/60",
                  )}
                  aria-label={`Go to ${scene.title}`}
                />
              ))}
            </div>

            {/* Guided mode controls - Next/Prev with play/pause */}
            {guidedMode && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1));
                    setRotation(0);
                  }}
                  disabled={currentSceneIndex === 0}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
                  aria-label="Previous stop"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 bg-amber rounded-full flex items-center justify-center text-midnight shadow-lg hover:scale-105 transition-transform"
                  style={{ boxShadow: "0 4px 20px rgba(255, 184, 92, 0.4)" }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1 fill-current" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setCurrentSceneIndex(
                      Math.min(scenes.length - 1, currentSceneIndex + 1),
                    );
                    setRotation(0);
                  }}
                  disabled={currentSceneIndex === scenes.length - 1}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
                  aria-label="Next stop"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Free Explore mode navigation */}
            {!guidedMode && !showHotspotSheet && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1));
                    setRotation(0);
                  }}
                  disabled={currentSceneIndex === 0}
                  className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2 text-white text-sm disabled:opacity-30 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  onClick={() => {
                    setCurrentSceneIndex(
                      Math.min(scenes.length - 1, currentSceneIndex + 1),
                    );
                    setRotation(0);
                  }}
                  disabled={currentSceneIndex === scenes.length - 1}
                  className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2 text-white text-sm disabled:opacity-30 hover:bg-white/20 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
