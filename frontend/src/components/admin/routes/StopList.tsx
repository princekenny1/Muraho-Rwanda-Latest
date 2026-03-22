import { Button } from "@/components/ui/button";
import { GripVertical, MapPin, Trash2 } from "lucide-react";
import type { RouteStop } from "@/types/routes";
import { cn } from "@/lib/utils";

interface StopListProps {
  stops: RouteStop[];
  selectedStopId: string | null;
  onSelect: (stopId: string) => void;
  onReorder: (stops: RouteStop[]) => void;
  onDelete: (stopId: string) => void;
}

export function StopList({
  stops,
  selectedStopId,
  onSelect,
  onReorder,
  onDelete,
}: StopListProps) {
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...stops];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onReorder(updated.map((s, i) => ({ ...s, stop_order: i + 1 })));
  };

  const handleMoveDown = (index: number) => {
    if (index >= stops.length - 1) return;
    const updated = [...stops];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onReorder(updated.map((s, i) => ({ ...s, stop_order: i + 1 })));
  };

  if (stops.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No stops yet</p>
        <p className="text-xs mt-1">Click "Add Stop" and then click on the map</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {stops.map((stop, index) => (
        <div
          key={stop.id}
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
            "hover:bg-accent/50",
            selectedStopId === stop.id && "bg-accent border border-amber/30"
          )}
          onClick={() => onSelect(stop.id)}
        >
          {/* Drag handle / order */}
          <div className="flex flex-col items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveUp(index);
              }}
              disabled={index === 0}
            >
              <GripVertical className="h-3 w-3" />
            </Button>
          </div>

          {/* Stop number */}
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: stop.marker_color || "#3b82f6" }}
          >
            {index + 1}
          </div>

          {/* Stop info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {stop.title || `Stop ${index + 1}`}
            </p>
            {stop.description && (
              <p className="text-xs text-muted-foreground truncate">
                {stop.description}
              </p>
            )}
          </div>

          {/* Duration badge */}
          {stop.duration_minutes && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {stop.duration_minutes}m
            </span>
          )}

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(stop.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
