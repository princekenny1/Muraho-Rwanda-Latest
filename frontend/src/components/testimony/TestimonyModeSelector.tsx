import { Headphones, Video, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export type TestimonyMode = "audio" | "video" | "read";

interface TestimonyModeSelectorProps {
  currentMode: TestimonyMode;
  onModeChange: (mode: TestimonyMode) => void;
  className?: string;
}

const modes = [
  { id: "audio" as const, label: "Audio", icon: Headphones },
  { id: "video" as const, label: "Video", icon: Video },
  { id: "read" as const, label: "Read", icon: BookOpen },
];

export function TestimonyModeSelector({
  currentMode,
  onModeChange,
  className,
}: TestimonyModeSelectorProps) {
  return (
    <div
      className={cn(
        "flex items-center bg-muted/50 rounded-xl p-1 gap-1",
        className
      )}
      role="tablist"
      aria-label="Testimony viewing mode"
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
