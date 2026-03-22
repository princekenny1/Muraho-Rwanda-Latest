import { useState } from "react";
import {
  ArrowLeft,
  Download,
  Play,
  Pause,
  MapPin,
  Clock,
  ChevronRight,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import coverImg from "@/assets/cover.jpg";
import kctPost from "@/assets/KCT-Post.jpg";
import kctPrecolonial from "@/assets/KCT-precolonial.jpg";
import kwaRubangura from "@/assets/kwa_rubangura.jpg";
import preColonial from "@/assets/pre-colonial.jpg";

interface RoutePageProps {
  routeId?: string;
  onBack: () => void;
  onStoryClick: (storyId: string) => void;
}

const mockRoute = {
  id: "kigali-musanze",
  title: "Kigali to Musanze",
  subtitle: "A journey through memory and mountains",
  duration: "4.5 hours",
  distance: "116 km",
  stopsCount: 8,
  coverImage: coverImg,
  isDownloaded: false,
  segments: [
    {
      id: "seg-1",
      title: "Departure: Kigali City Center",
      subtitle: "Begin your journey from the heart of the capital",
      duration: "3 min",
      distance: "0 km",
      theme: "travel",
      hasSensitiveContent: false,
      imageUrl: kctPost,
    },
    {
      id: "seg-2",
      title: "Kigali Genocide Memorial",
      subtitle: "A place of remembrance and education",
      duration: "15 min",
      distance: "4.2 km",
      theme: "remembrance",
      hasSensitiveContent: true,
      imageUrl: kctPrecolonial,
    },
    {
      id: "seg-3",
      title: "Rulindo District Stories",
      subtitle: "Tales of resilience from the hills",
      duration: "8 min",
      distance: "32 km",
      theme: "culture",
      hasSensitiveContent: false,
      imageUrl: kwaRubangura,
    },
    {
      id: "seg-4",
      title: "Base of the Virungas",
      subtitle: "Where the mountains meet the sky",
      duration: "5 min",
      distance: "95 km",
      theme: "travel",
      hasSensitiveContent: false,
      imageUrl: preColonial,
    },
    {
      id: "seg-5",
      title: "Arrival: Musanze",
      subtitle: "Gateway to the gorillas",
      duration: "4 min",
      distance: "116 km",
      theme: "travel",
      hasSensitiveContent: false,
      imageUrl: coverImg,
    },
  ],
};

const themeColors = {
  travel: "bg-adventure-green",
  remembrance: "bg-muted-indigo",
  culture: "bg-terracotta",
};

const themeBgColors = {
  travel: "bg-adventure-green/10",
  remembrance: "bg-muted-indigo/10",
  culture: "bg-terracotta/10",
};

export function RoutePage({ routeId, onBack, onStoryClick }: RoutePageProps) {
  const [isDownloaded, setIsDownloaded] = useState(mockRoute.isDownloaded);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const route = mockRoute;

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false);
      setIsDownloaded(true);
    }, 2000);
  };

  const handleStartRoute = () => {
    setActiveSegment(route.segments[0].id);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Cover */}
      <div className="relative h-72">
        <img
          src={route.coverImage}
          alt={route.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors safe-area-pt"
        >
          <ArrowLeft className="w-5 h-5 text-midnight" />
        </button>

        {/* Offline status */}
        <div className="absolute top-4 right-4 safe-area-pt">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm",
              isDownloaded
                ? "bg-adventure-green/90 text-midnight"
                : "bg-white/90 text-muted-foreground",
            )}
          >
            {isDownloaded ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                Available Offline
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                Online Only
              </>
            )}
          </div>
        </div>

        {/* Route info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
          <h1 className="font-serif text-2xl font-semibold text-white mb-2">
            {route.title}
          </h1>
          <p className="text-white/80 text-sm mb-4">{route.subtitle}</p>

          <div className="flex items-center gap-4 text-white/70 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {route.duration}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {route.distance}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber rounded-full" />
              {route.stopsCount} stops
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="flex gap-3">
          <Button size="lg" className="flex-1" onClick={handleStartRoute}>
            <Play className="w-5 h-5 mr-2" />
            Start Route
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloaded || isDownloading}
            className={cn(
              "px-4",
              isDownloaded &&
                "bg-adventure-green/10 border-adventure-green text-adventure-green",
            )}
          >
            {isDownloading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isDownloaded ? (
              <WifiOff className="w-5 h-5" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mini Map Strip */}
      <div className="px-4 mt-8">
        <div className="relative bg-midnight/5 rounded-2xl p-4">
          {/* Dotted path */}
          <div className="flex items-center justify-between relative">
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-midnight/20" />
            {route.segments.map((segment, idx) => (
              <div
                key={segment.id}
                className={cn(
                  "relative z-10 w-4 h-4 rounded-full transition-all",
                  activeSegment === segment.id
                    ? "w-5 h-5 bg-amber ring-4 ring-amber/30"
                    : themeColors[segment.theme as keyof typeof themeColors],
                )}
              />
            ))}
          </div>

          {/* Map CTA */}
          <button className="flex items-center justify-center gap-2 w-full mt-4 text-amber text-sm font-medium hover:text-sunset-gold transition-colors">
            Open Full Map
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Route Segments */}
      <div className="px-4 mt-8 pb-8">
        <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
          Route Segments
        </h2>

        <div className="space-y-3">
          {route.segments.map((segment, idx) => (
            <button
              key={segment.id}
              onClick={() => onStoryClick(segment.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                themeBgColors[segment.theme as keyof typeof themeBgColors],
                activeSegment === segment.id && "ring-2 ring-amber",
              )}
            >
              {/* Image */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={segment.imageUrl}
                  alt={segment.title}
                  className="w-full h-full object-cover"
                />
                {activeSegment === segment.id && isPlaying && (
                  <div className="absolute inset-0 bg-midnight/50 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center">
                      <Pause className="w-4 h-4 text-midnight" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground text-sm truncate">
                    {segment.title}
                  </h3>
                  {segment.hasSensitiveContent && (
                    <AlertTriangle className="w-4 h-4 text-muted-indigo flex-shrink-0" />
                  )}
                </div>
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                  {segment.subtitle}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {segment.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {segment.distance}
                  </span>
                </div>
              </div>

              {/* Index */}
              <div className="w-8 h-8 rounded-full bg-midnight/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-foreground">
                  {idx + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
