import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ThenNowSliderProps {
  thenImage: string;
  nowImage: string;
  thenLabel?: string;
  nowLabel?: string;
}

export function ThenNowSlider({
  thenImage,
  nowImage,
  thenLabel = "Then",
  nowLabel = "Now",
}: ThenNowSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-ew-resize select-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Now Image (Background) */}
      <img
        src={nowImage}
        alt={nowLabel}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Then Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={thenImage}
          alt={thenLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            width: containerRef.current ? containerRef.current.offsetWidth : '100%',
            maxWidth: 'none'
          }}
          draggable={false}
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-amber rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-midnight rounded-full" />
            <div className="w-0.5 h-4 bg-midnight rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-3 left-3 px-2 py-1 bg-serenity-grey/90 text-midnight text-xs font-medium rounded">
        {thenLabel}
      </span>
      <span className="absolute bottom-3 right-3 px-2 py-1 bg-midnight/90 text-white text-xs font-medium rounded">
        {nowLabel}
      </span>
    </div>
  );
}
