import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type HeatmapMode = "emotional" | "popularity" | "duration";

export interface RouteSegment {
  id: string;
  points?: number[][];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  emotionalTone: "intense" | "inspiring" | "historical" | "peaceful";
  popularity: number; // 0-100
  duration: number; // minutes
}

interface RouteHeatmapProps {
  segments: RouteSegment[];
  mode: HeatmapMode;
  showLabels?: boolean;
  animated?: boolean;
  className?: string;
}

const emotionalColors: Record<string, { start: string; end: string }> = {
  intense: { start: "#4B5573", end: "#1B2D40" },
  inspiring: { start: "#70C1A5", end: "#2C6E6F" },
  historical: { start: "#C46A4A", end: "#B68D40" },
  peaceful: { start: "#6FA8C7", end: "#70C1A5" },
};

const getSegmentColor = (segment: RouteSegment, mode: HeatmapMode): string => {
  if (mode === "emotional") {
    return emotionalColors[segment.emotionalTone]?.start || "#70C1A5";
  }
  
  if (mode === "popularity") {
    // Gradient from cool to warm based on popularity
    const hue = 120 - (segment.popularity * 1.2); // 120 (green) to 0 (red)
    return `hsl(${hue}, 65%, 50%)`;
  }
  
  if (mode === "duration") {
    // Gradient based on segment duration
    const normalized = Math.min(segment.duration / 20, 1);
    const hue = 200 - (normalized * 160); // Blue to orange
    return `hsl(${hue}, 70%, 55%)`;
  }
  
  return "#70C1A5";
};

const getSegmentWidth = (segment: RouteSegment, mode: HeatmapMode): number => {
  if (mode === "popularity") {
    return 2 + (segment.popularity / 100) * 6; // 2-8px
  }
  if (mode === "duration") {
    return 2 + Math.min(segment.duration / 20, 1) * 6;
  }
  return 4;
};

export function RouteHeatmap({
  segments,
  mode,
  showLabels = false,
  animated = true,
  className,
}: RouteHeatmapProps) {
  const pathData = useMemo(() => {
    if (segments.length === 0) return "";
    
    // Handle both formats: points array or startX/endX format
    const getPoint = (seg: RouteSegment, position: 'start' | 'end'): [number, number] => {
      if (seg.points && seg.points.length > 0) {
        const idx = position === 'start' ? 0 : seg.points.length - 1;
        return [seg.points[idx][0], seg.points[idx][1]];
      }
      return position === 'start' 
        ? [seg.startX || 0, seg.startY || 0]
        : [seg.endX || 0, seg.endY || 0];
    };
    
    const [startX, startY] = getPoint(segments[0], 'start');
    let path = `M ${startX} ${startY}`;
    
    segments.forEach((seg, i) => {
      const [endX, endY] = getPoint(seg, 'end');
      // Use quadratic curves for smoother paths
      if (i < segments.length - 1) {
        const [nextStartX, nextStartY] = getPoint(segments[i + 1], 'start');
        const midX = (endX + nextStartX) / 2;
        const midY = (endY + nextStartY) / 2;
        path += ` Q ${endX} ${endY} ${midX} ${midY}`;
      } else {
        path += ` L ${endX} ${endY}`;
      }
    });
    
    return path;
  }, [segments]);

  return (
    <svg 
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Gradient definitions for each segment */}
        {segments.map((segment, i) => {
          const getPoint = (seg: RouteSegment, position: 'start' | 'end'): [number, number] => {
            if (seg.points && seg.points.length > 0) {
              const idx = position === 'start' ? 0 : seg.points.length - 1;
              return [seg.points[idx][0], seg.points[idx][1]];
            }
            return position === 'start' 
              ? [seg.startX || 0, seg.startY || 0]
              : [seg.endX || 0, seg.endY || 0];
          };
          
          const [startX, startY] = getPoint(segment, 'start');
          const [endX, endY] = getPoint(segment, 'end');
          
          return (
            <linearGradient
              key={`gradient-${segment.id}`}
              id={`segment-gradient-${segment.id}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={getSegmentColor(segment, mode)} stopOpacity="0.9" />
              <stop offset="100%" stopColor={getSegmentColor(segments[i + 1] || segment, mode)} stopOpacity="0.9" />
            </linearGradient>
          );
        })}

        {/* Glow filter */}
        <filter id="route-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Animated dash pattern */}
        {animated && (
          <pattern id="moving-dots" patternUnits="userSpaceOnUse" width="20" height="1">
            <circle r="2" fill="white" opacity="0.6">
              <animate
                attributeName="cx"
                from="0"
                to="20"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </pattern>
        )}
      </defs>

      {/* Background path (glow effect) */}
      <path
        d={pathData}
        fill="none"
        stroke="url(#segment-gradient-base)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#route-glow)"
        opacity="0.3"
      />

      {/* Individual segment paths */}
      {segments.map((segment, i) => {
        const nextSeg = segments[i + 1];
        let segPath = `M ${segment.startX} ${segment.startY}`;
        
        if (nextSeg) {
          const midX = (segment.endX + nextSeg.startX) / 2;
          const midY = (segment.endY + nextSeg.startY) / 2;
          segPath += ` Q ${segment.endX} ${segment.endY} ${midX} ${midY}`;
        } else {
          segPath += ` L ${segment.endX} ${segment.endY}`;
        }

        return (
          <g key={segment.id}>
            {/* Main colored path */}
            <path
              d={segPath}
              fill="none"
              stroke={`url(#segment-gradient-${segment.id})`}
              strokeWidth={getSegmentWidth(segment, mode)}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={animated ? "animate-pulse" : ""}
              style={{ animationDelay: `${i * 200}ms` }}
            />

            {/* Animated overlay for active segments */}
            {animated && (
              <path
                d={segPath}
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 12"
                opacity="0.4"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="16"
                  to="0"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </path>
            )}
          </g>
        );
      })}

      {/* Segment labels */}
      {showLabels && segments.map((segment) => {
        const midX = (segment.startX + segment.endX) / 2;
        const midY = (segment.startY + segment.endY) / 2;

        return (
          <g key={`label-${segment.id}`}>
            <rect
              x={midX - 30}
              y={midY - 10}
              width="60"
              height="20"
              rx="10"
              fill="hsl(var(--midnight))"
              opacity="0.9"
            />
            <text
              x={midX}
              y={midY + 4}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontFamily="Inter, sans-serif"
            >
              {segment.duration}m
            </text>
          </g>
        );
      })}
    </svg>
  );
}
