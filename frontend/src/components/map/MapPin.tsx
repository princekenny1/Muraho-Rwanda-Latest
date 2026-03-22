import { cn } from "@/lib/utils";

export type PinTheme = "remembrance" | "culture" | "travel" | "museum";

interface MapPinProps {
  id: string;
  theme: PinTheme;
  title: string;
  isSelected?: boolean;
  isNearby?: boolean;
  onClick: (id: string) => void;
  style?: React.CSSProperties;
}

const themeColors: Record<PinTheme, { bg: string; glow: string; rgb: string }> = {
  remembrance: { 
    bg: "bg-muted-indigo", 
    glow: "rgba(75, 85, 115, 0.08)",
    rgb: "75, 85, 115"
  },
  culture: { 
    bg: "bg-terracotta", 
    glow: "rgba(196, 106, 74, 0.08)",
    rgb: "196, 106, 74"
  },
  travel: { 
    bg: "bg-adventure-green", 
    glow: "rgba(112, 193, 165, 0.08)",
    rgb: "112, 193, 165"
  },
  museum: { 
    bg: "bg-forest-teal", 
    glow: "rgba(44, 110, 111, 0.08)",
    rgb: "44, 110, 111"
  },
};

export function MapPin({ id, theme, title, isSelected, isNearby, onClick, style }: MapPinProps) {
  const colors = themeColors[theme];
  
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group",
        isSelected && "z-30 scale-125",
        isNearby && !isSelected && "animate-bounce-pin",
        !isSelected && !isNearby && "hover:scale-110"
      )}
      style={style}
      aria-label={title}
    >
      {/* Outer glow ring - default 8% opacity */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          isSelected ? "scale-[2]" : isNearby ? "scale-[1.5]" : "scale-[1.3]"
        )}
        style={{
          boxShadow: isSelected 
            ? `0 0 24px 12px rgba(${colors.rgb}, 0.35), 0 0 0 3px rgba(255, 184, 92, 0.6)`
            : isNearby
            ? `0 0 16px 8px rgba(${colors.rgb}, 0.25)`
            : `0 0 12px 4px rgba(${colors.rgb}, 0.08)`,
        }}
      />
      
      {/* Main pin */}
      <div 
        className={cn(
          "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
          colors.bg,
          isSelected && "ring-2 ring-amber ring-offset-2 ring-offset-white"
        )}
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}
      >
        {/* Inner dot */}
        <div className="w-3 h-3 bg-white rounded-full" />
        
        {/* Amber indicator dot for selected */}
        {isSelected && (
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber animate-pulse"
            style={{ boxShadow: '0 0 8px 2px rgba(255, 184, 92, 0.6)' }}
          />
        )}
      </div>
      
      {/* Hover tooltip */}
      <div 
        className={cn(
          "absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-3 py-1.5 rounded-lg",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
          isSelected && "opacity-100"
        )}
        style={{
          background: 'hsl(var(--midnight))',
          color: '#FAFAFA',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        {title}
        {/* Tether line for selected */}
        {isSelected && (
          <div 
            className="absolute -top-3 left-1/2 w-0.5 h-3 -translate-x-1/2"
            style={{ background: 'rgba(255, 184, 92, 0.6)' }}
          />
        )}
      </div>
    </button>
  );
}
