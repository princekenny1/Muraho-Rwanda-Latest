import { ExternalLink, FileText, Film, Mic, Building2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AskRwandaSource {
  id: string;
  type: "story" | "testimony" | "museum_panel" | "documentary" | "location";
  title: string;
  subtitle?: string;
  url?: string;
}

interface AskRwandaSourceCardProps {
  source: AskRwandaSource;
  onClick?: () => void;
}

const typeConfig = {
  story: {
    icon: FileText,
    label: "Story",
    className: "bg-amber/10 text-amber border-amber/30",
  },
  testimony: {
    icon: Mic,
    label: "Testimony",
    className: "bg-muted-indigo/10 text-muted-indigo border-muted-indigo/30",
  },
  museum_panel: {
    icon: Building2,
    label: "Museum Panel",
    className: "bg-forest-teal/10 text-forest-teal border-forest-teal/30",
  },
  documentary: {
    icon: Film,
    label: "Documentary",
    className: "bg-terracotta/10 text-terracotta border-terracotta/30",
  },
  location: {
    icon: MapPin,
    label: "Location",
    className: "bg-adventure-green/10 text-adventure-green border-adventure-green/30",
  },
};

export function AskRwandaSourceCard({ source, onClick }: AskRwandaSourceCardProps) {
  const config = typeConfig[source.type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
        "hover:scale-[1.02] active:scale-[0.98]",
        config.className
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-medium truncate">{source.title}</p>
        {source.subtitle && (
          <p className="text-[10px] opacity-70 truncate">{source.subtitle}</p>
        )}
      </div>
      {source.url && <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />}
    </button>
  );
}
