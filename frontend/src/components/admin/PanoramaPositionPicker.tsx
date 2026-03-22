import { useState, useRef, useCallback, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface PanoramaPositionPickerProps {
  panoramaUrl: string;
  positionX: number;
  positionY: number;
  onPositionChange: (x: number, y: number) => void;
  hotspotType?: string;
}

const typeColors: Record<string, string> = {
  info: "bg-primary border-primary/50",
  audio: "bg-green-500 border-green-300",
  video: "bg-purple-500 border-purple-300",
  "next-scene": "bg-amber-500 border-amber-300",
  landmark: "bg-rose-500 border-rose-300",
};

export function PanoramaPositionPicker({
  panoramaUrl,
  positionX,
  positionY,
  onPositionChange,
  hotspotType = "info",
}: PanoramaPositionPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Clamp values between 0 and 100
    return {
      x: Math.max(0, Math.min(100, Math.round(x * 10) / 10)),
      y: Math.max(0, Math.min(100, Math.round(y * 10) / 10)),
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    const position = calculatePosition(e.clientX, e.clientY);
    if (position) {
      onPositionChange(position.x, position.y);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const position = calculatePosition(e.clientX, e.clientY);
    if (position) {
      onPositionChange(position.x, position.y);
    }
  };

  // Add global mouse listeners for drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const position = calculatePosition(e.clientX, e.clientY);
      if (position) {
        onPositionChange(position.x, position.y);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, calculatePosition, onPositionChange]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Click on the panorama to position the hotspot</p>
      <div
        ref={containerRef}
        className="relative rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 cursor-crosshair select-none"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        <AspectRatio ratio={2 / 1}>
          <img
            src={panoramaUrl}
            alt="Panorama preview"
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Hotspot marker */}
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
            style={{
              left: `${positionX}%`,
              top: `${positionY}%`,
            }}
          >
            {/* Outer pulse ring */}
            <div
              className={cn(
                "absolute w-10 h-10 rounded-full opacity-30 animate-ping -translate-x-1/2 -translate-y-1/2",
                typeColors[hotspotType]?.split(" ")[0] || "bg-blue-500"
              )}
            />
            {/* Inner marker */}
            <div
              className={cn(
                "relative w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center -translate-x-1/2 -translate-y-1/2",
                typeColors[hotspotType]?.split(" ")[0] || "bg-blue-500"
              )}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          {/* Crosshair guides */}
          <div
            className="absolute w-px h-full bg-white/30 pointer-events-none"
            style={{ left: `${positionX}%` }}
          />
          <div
            className="absolute h-px w-full bg-white/30 pointer-events-none"
            style={{ top: `${positionY}%` }}
          />
        </AspectRatio>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Position: ({positionX.toFixed(1)}%, {positionY.toFixed(1)}%)
      </p>
    </div>
  );
}
