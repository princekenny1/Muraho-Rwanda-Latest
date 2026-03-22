import { Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExhibitionHeaderProps {
  title: string;
  sectionLabel: string;
  duration: string;
  panelNumber: number;
  totalPanels: number;
}

export function ExhibitionHeader({
  title,
  sectionLabel,
  duration,
  panelNumber,
  totalPanels,
}: ExhibitionHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Section & Progress */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-muted-indigo/20 text-muted-indigo">
          <MapPin className="w-3 h-3 mr-1" />
          {sectionLabel}
        </Badge>
        <span className="text-xs text-muted-foreground font-medium">
          Panel {panelNumber} of {totalPanels}
        </span>
      </div>

      {/* Title */}
      <h1 className="font-serif text-2xl font-bold text-foreground leading-tight">
        {title}
      </h1>

      {/* Duration */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>{duration} read</span>
      </div>
    </div>
  );
}
