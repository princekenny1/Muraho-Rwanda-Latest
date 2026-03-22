import { MapPin, Route, Building2, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AskRwandaContextType = "location" | "route" | "museum" | "story" | null;

export interface AskRwandaContext {
  type: AskRwandaContextType;
  id: string;
  title: string;
}

interface AskRwandaContextChipProps {
  context: AskRwandaContext;
  onClear?: () => void;
}

const contextConfig = {
  location: {
    icon: MapPin,
    label: "About",
    className: "bg-adventure-green/10 text-adventure-green border-adventure-green/30",
  },
  route: {
    icon: Route,
    label: "Journey",
    className: "bg-sky-blue/10 text-sky-500 border-sky-blue/30",
  },
  museum: {
    icon: Building2,
    label: "Museum",
    className: "bg-forest-teal/10 text-forest-teal border-forest-teal/30",
  },
  story: {
    icon: FileText,
    label: "Story",
    className: "bg-amber/10 text-amber border-amber/30",
  },
};

export function AskRwandaContextChip({ context, onClear }: AskRwandaContextChipProps) {
  if (!context.type) return null;

  const config = contextConfig[context.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium",
        config.className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}:</span>
      <span className="font-semibold max-w-[150px] truncate">{context.title}</span>
      {onClear && (
        <button
          onClick={onClear}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
