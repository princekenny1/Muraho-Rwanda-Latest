import { Headphones, Video, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "audio" | "video" | "read";

interface ModeSwitcherProps {
  activeMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  availableModes?: ViewMode[];
  className?: string;
}

const modeConfig = {
  audio: {
    icon: Headphones,
    label: "Audio",
  },
  video: {
    icon: Video,
    label: "Video",
  },
  read: {
    icon: BookOpen,
    label: "Read",
  },
};

export function ModeSwitcher({
  activeMode,
  onModeChange,
  availableModes = ["audio", "video", "read"],
  className,
}: ModeSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 bg-midnight/5 rounded-xl",
        className
      )}
    >
      {availableModes.map((mode) => {
        const config = modeConfig[mode];
        const Icon = config.icon;
        const isActive = mode === activeMode;

        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-amber text-midnight shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-midnight/5"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
