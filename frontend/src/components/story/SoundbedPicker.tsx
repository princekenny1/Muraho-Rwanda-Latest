import { useState } from "react";
import { Volume2, Wind, Bird, Building2, Moon, VolumeX, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type SoundbedType = "none" | "wind" | "nature" | "city" | "night" | "custom";

interface Soundbed {
  id: SoundbedType;
  label: string;
  description: string;
  icon: React.ElementType;
  preview?: string; // Audio URL for preview
}

interface SoundbedPickerProps {
  activeSoundbed: SoundbedType;
  volume: number;
  onSoundbedChange: (soundbed: SoundbedType) => void;
  onVolumeChange: (volume: number) => void;
  isCompact?: boolean;
  className?: string;
}

const soundbeds: Soundbed[] = [
  {
    id: "none",
    label: "Silence",
    description: "No background audio",
    icon: VolumeX,
  },
  {
    id: "wind",
    label: "Ambient Wind",
    description: "Gentle breeze through hills",
    icon: Wind,
  },
  {
    id: "nature",
    label: "Nature Sounds",
    description: "Birds and rustling leaves",
    icon: Bird,
  },
  {
    id: "city",
    label: "Kigali City",
    description: "Urban ambiance",
    icon: Building2,
  },
  {
    id: "night",
    label: "Night Sounds",
    description: "Crickets and distant echoes",
    icon: Moon,
  },
];

export function SoundbedPicker({
  activeSoundbed,
  volume,
  onSoundbedChange,
  onVolumeChange,
  isCompact = false,
  className,
}: SoundbedPickerProps) {
  const [isExpanded, setIsExpanded] = useState(!isCompact);

  if (isCompact && !isExpanded) {
    const active = soundbeds.find((s) => s.id === activeSoundbed);
    const Icon = active?.icon || Volume2;
    
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl bg-midnight/10 hover:bg-midnight/20 transition-colors",
          className
        )}
      >
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{active?.label || "Soundbed"}</span>
      </button>
    );
  }

  return (
    <div className={cn("bg-card rounded-2xl p-4 shadow-card border border-border/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Background Soundbed</h3>
        </div>
        
        {isCompact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Collapse
          </button>
        )}
      </div>

      {/* Soundbed options */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {soundbeds.map((soundbed) => {
          const Icon = soundbed.icon;
          const isActive = activeSoundbed === soundbed.id;
          
          return (
            <button
              key={soundbed.id}
              onClick={() => onSoundbedChange(soundbed.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                isActive
                  ? "bg-amber/20 border-2 border-amber"
                  : "bg-muted/50 border-2 border-transparent hover:bg-muted"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isActive ? "bg-amber text-midnight" : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{soundbed.label}</p>
                <p className="text-xs text-muted-foreground truncate">{soundbed.description}</p>
              </div>
              {isActive && (
                <Check className="w-4 h-4 text-amber flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Volume control */}
      {activeSoundbed !== "none" && (
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          <VolumeX className="w-4 h-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-amber
              [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
