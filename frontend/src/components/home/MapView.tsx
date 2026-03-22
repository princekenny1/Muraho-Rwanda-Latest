import { useState } from "react";
import { MapPin, Navigation, Layers, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  mode: "remembrance" | "culture" | "travel" | "museum";
  title: string;
}

interface MapViewProps {
  markers: MapMarker[];
  onMarkerClick: (id: string) => void;
}

const modeColors = {
  remembrance: "bg-muted-indigo",
  culture: "bg-terracotta",
  travel: "bg-adventure-green",
  museum: "bg-forest-teal",
};

export function MapView({ markers, onMarkerClick }: MapViewProps) {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  return (
    <div
      className="relative w-full h-72"
      style={{
        borderRadius: "24px",
        boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.12)",
        overflow: "hidden",
        border: "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* Premium gradient overlay at top */}
      <div
        className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10, 26, 47, 0.08) 0%, transparent 100%)",
        }}
      />

      {/* Stylized Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/25 via-cloud-mist to-adventure-green/10">
        {/* Enhanced grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-15"
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
                className="text-midnight"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Dotted route lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 288">
          <path
            d="M 40 240 Q 140 200 200 144 T 360 60"
            fill="none"
            stroke="hsl(var(--midnight))"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.25"
            strokeLinecap="round"
          />
          <path
            d="M 80 288 Q 160 220 240 190 T 400 160"
            fill="none"
            stroke="hsl(var(--midnight))"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.15"
            strokeLinecap="round"
          />
        </svg>

        {/* Subtle topographic lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          viewBox="0 0 400 288"
        >
          <ellipse
            cx="280"
            cy="100"
            rx="80"
            ry="40"
            fill="none"
            stroke="hsl(var(--forest-teal))"
            strokeWidth="1"
          />
          <ellipse
            cx="280"
            cy="100"
            rx="60"
            ry="30"
            fill="none"
            stroke="hsl(var(--forest-teal))"
            strokeWidth="1"
          />
          <ellipse
            cx="120"
            cy="200"
            rx="60"
            ry="35"
            fill="none"
            stroke="hsl(var(--adventure-green))"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Map Markers with glow animation */}
      {markers.map((marker, index) => (
        <button
          key={`${marker.id}-${index}`}
          onClick={() => {
            setActiveMarker(marker.id);
            onMarkerClick(marker.id);
          }}
          className={cn(
            "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
            activeMarker === marker.id ? "scale-125 z-20" : "hover:scale-110",
          )}
          style={{
            left: `${18 + index * 22}%`,
            top: `${28 + (index % 3) * 22}%`,
            animationDelay: `${index * 150}ms`,
          }}
        >
          <div className="relative">
            {/* Animated glow ring */}
            <div
              className={cn(
                "absolute inset-0 rounded-full animate-pulse",
                activeMarker === marker.id ? "opacity-100" : "opacity-40",
              )}
              style={{
                boxShadow: `0 0 12px 4px ${
                  marker.mode === "remembrance"
                    ? "rgba(75, 85, 115, 0.5)"
                    : marker.mode === "culture"
                      ? "rgba(196, 106, 74, 0.5)"
                      : marker.mode === "travel"
                        ? "rgba(112, 193, 165, 0.5)"
                        : "rgba(44, 110, 111, 0.5)"
                }`,
                transform: "scale(1.3)",
              }}
            />
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-shadow duration-300",
                modeColors[marker.mode],
                activeMarker === marker.id &&
                  "ring-2 ring-white ring-offset-2 ring-offset-transparent",
              )}
              style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }}
            >
              <MapPin className="w-4.5 h-4.5 text-white" />
            </div>
            {activeMarker === marker.id && (
              <div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-3 py-1.5 rounded-lg animate-scale-in"
                style={{
                  background: "hsl(var(--midnight))",
                  color: "#FAFAFA",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
              >
                {marker.title}
              </div>
            )}
          </div>
        </button>
      ))}

      {/* Map Controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-2 z-20">
        <button
          className="w-10 h-10 bg-card rounded-xl flex items-center justify-center hover:bg-cloud-mist transition-all duration-200"
          style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
        >
          <Navigation className="w-4 h-4 text-foreground" />
        </button>
        <button
          className="w-10 h-10 bg-card rounded-xl flex items-center justify-center hover:bg-cloud-mist transition-all duration-200"
          style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
        >
          <Layers className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Location Label */}
      <div
        className="absolute bottom-3 left-3 px-4 py-2 rounded-xl border"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderColor: "rgba(0, 0, 0, 0.06)",
        }}
      >
        <span className="text-sm font-medium text-foreground">
          Kigali, Rwanda
        </span>
      </div>

      {/* Open Full Map Action */}
      <button
        className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
        style={{
          background: "hsl(var(--amber))",
          color: "hsl(var(--midnight))",
          boxShadow: "0 4px 12px rgba(255, 184, 92, 0.4)",
        }}
      >
        Open Full Map
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
