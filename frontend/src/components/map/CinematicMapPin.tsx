import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type PinTheme = "remembrance" | "culture" | "travel" | "museum";
export type EmotionalTone = "intense" | "inspiring" | "historical" | "peaceful";

interface CinematicMapPinProps {
  id: string;
  theme: PinTheme;
  title: string;
  emotionalTone?: EmotionalTone;
  isSelected?: boolean;
  isNearby?: boolean;
  isPlaying?: boolean;
  popularity?: number; // 0-100 for heatmap intensity
  hasUnheardStory?: boolean;
  onClick: (id: string) => void;
  style?: React.CSSProperties;
}

const themeColors: Record<PinTheme, { bg: string; glow: string; rgb: string }> = {
  remembrance: { 
    bg: "bg-muted-indigo", 
    glow: "rgba(75, 85, 115, 0.25)",
    rgb: "75, 85, 115"
  },
  culture: { 
    bg: "bg-terracotta", 
    glow: "rgba(196, 106, 74, 0.25)",
    rgb: "196, 106, 74"
  },
  travel: { 
    bg: "bg-adventure-green", 
    glow: "rgba(112, 193, 165, 0.25)",
    rgb: "112, 193, 165"
  },
  museum: { 
    bg: "bg-forest-teal", 
    glow: "rgba(44, 110, 111, 0.25)",
    rgb: "44, 110, 111"
  },
};

const toneGradients: Record<EmotionalTone, string> = {
  intense: "from-muted-indigo to-midnight",
  inspiring: "from-adventure-green to-forest-teal",
  historical: "from-terracotta to-sunset-gold",
  peaceful: "from-sky-blue to-adventure-green",
};

export function CinematicMapPin({ 
  id, 
  theme, 
  title, 
  emotionalTone,
  isSelected, 
  isNearby, 
  isPlaying,
  popularity = 50,
  hasUnheardStory = true,
  onClick, 
  style 
}: CinematicMapPinProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);
  const colors = themeColors[theme];
  
  // Animated pulse for nearby pins
  useEffect(() => {
    if (!isNearby || isSelected) return;
    
    const interval = setInterval(() => {
      setPulsePhase((p) => (p + 1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, [isNearby, isSelected]);

  // Calculate heatmap glow intensity
  const heatmapIntensity = popularity / 100;
  const glowSize = 8 + (heatmapIntensity * 16); // 8-24px based on popularity

  return (
    <button
      onClick={() => onClick(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group",
        isSelected && "z-30 scale-125",
        isNearby && !isSelected && "z-20",
        !isSelected && !isNearby && "hover:scale-110"
      )}
      style={style}
      aria-label={title}
    >
      {/* Heatmap glow layer (always visible, intensity varies) */}
      <div 
        className="absolute inset-0 rounded-full transition-all duration-500"
        style={{
          transform: `scale(${2 + heatmapIntensity})`,
          background: `radial-gradient(circle, rgba(${colors.rgb}, ${0.1 + heatmapIntensity * 0.15}) 0%, transparent 70%)`,
          filter: `blur(${glowSize / 2}px)`,
        }}
      />

      {/* Animated pulse ring for nearby */}
      {isNearby && !isSelected && (
        <>
          <div 
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{
              borderColor: `rgba(${colors.rgb}, 0.6)`,
              animationDuration: '2s',
            }}
          />
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              transform: `scale(${1.5 + Math.sin(pulsePhase * Math.PI / 180) * 0.3})`,
              boxShadow: `0 0 ${16 + Math.sin(pulsePhase * Math.PI / 180) * 8}px ${8}px rgba(${colors.rgb}, 0.4)`,
            }}
          />
        </>
      )}

      {/* Selected state outer ring */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse-glow"
          style={{
            transform: 'scale(2.2)',
            boxShadow: `0 0 32px 16px rgba(255, 184, 92, 0.5), 0 0 0 4px rgba(255, 184, 92, 0.8)`,
          }}
        />
      )}

      {/* Main pin body */}
      <div 
        className={cn(
          "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
          emotionalTone ? `bg-gradient-to-br ${toneGradients[emotionalTone]}` : colors.bg,
          isSelected && "ring-3 ring-amber ring-offset-2 ring-offset-white",
          isPlaying && "ring-2 ring-adventure-green ring-offset-1 ring-offset-white"
        )}
        style={{ 
          boxShadow: isSelected 
            ? '0 8px 24px rgba(0, 0, 0, 0.25)' 
            : '0 4px 12px rgba(0, 0, 0, 0.2)' 
        }}
      >
        {/* Inner icon/dot */}
        {isPlaying ? (
          // Sound waves animation for playing
          <div className="flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-1 bg-white rounded-full animate-bounce"
                style={{ 
                  height: `${8 + Math.random() * 8}px`,
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-3.5 h-3.5 bg-white rounded-full" />
        )}
        
        {/* Unheard story indicator */}
        {hasUnheardStory && !isPlaying && (
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber border-2 border-white"
            style={{ boxShadow: '0 0 8px 2px rgba(255, 184, 92, 0.5)' }}
          />
        )}
        
        {/* Playing indicator */}
        {isPlaying && (
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-adventure-green animate-pulse"
            style={{ boxShadow: '0 0 8px 2px rgba(112, 193, 165, 0.6)' }}
          />
        )}
      </div>
      
      {/* Hover/Selected tooltip */}
      <div 
        className={cn(
          "absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-2 rounded-xl",
          "transition-all duration-200 pointer-events-none",
          (isSelected || isHovered) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
        style={{
          background: 'hsl(var(--midnight))',
          color: '#FAFAFA',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        }}
      >
        <p className="text-xs font-medium">{title}</p>
        {emotionalTone && (
          <p className="text-xs opacity-70 capitalize">{emotionalTone}</p>
        )}
        
        {/* Tooltip tether */}
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '8px solid hsl(var(--midnight))',
          }}
        />
      </div>
    </button>
  );
}
