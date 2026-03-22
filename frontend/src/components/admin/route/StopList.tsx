import { GripVertical, MapPin, Trash2, Clock, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { RouteStop } from "@/types/routes";
import { haversineDistance, formatDistance } from "@/lib/routeCalculations";

interface StopListProps {
  stops: RouteStop[];
  selectedStopId: string | null;
  onSelect: (stopId: string) => void;
  onReorder: (stops: RouteStop[]) => void;
  onDelete: (stopId: string) => void;
}

export function StopList({ stops, selectedStopId, onSelect, onReorder, onDelete }: StopListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex((s) => s.id === active.id);
      const newIndex = stops.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(stops, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  // Calculate distance to next stop
  const getDistanceToNext = (currentIndex: number): number | null => {
    if (currentIndex >= stops.length - 1) return null;
    const current = stops[currentIndex];
    const next = stops[currentIndex + 1];
    return haversineDistance(
      Number(current.latitude),
      Number(current.longitude),
      Number(next.latitude),
      Number(next.longitude)
    );
  };

  if (stops.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No stops yet</p>
        <p className="text-xs mt-1">Click "Add Stop" and then click on the map</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div>
          {stops.map((stop, index) => (
            <div key={stop.id}>
              <SortableStopItem
                stop={stop}
                index={index}
                isSelected={stop.id === selectedStopId}
                onSelect={onSelect}
                onDelete={onDelete}
              />
              {index < stops.length - 1 && (
                <DistanceIndicator distance={getDistanceToNext(index)} />
              )}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function DistanceIndicator({ distance }: { distance: number | null }) {
  if (distance === null) return null;
  
  return (
    <div className="flex items-center justify-center gap-1.5 py-1.5 bg-muted/50 text-xs text-muted-foreground">
      <ArrowDown className="h-3 w-3" />
      <span>{formatDistance(distance)}</span>
    </div>
  );
}

interface SortableStopItemProps {
  stop: RouteStop;
  index: number;
  isSelected: boolean;
  onSelect: (stopId: string) => void;
  onDelete: (stopId: string) => void;
}

function SortableStopItem({ stop, index, isSelected, onSelect, onDelete }: SortableStopItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-3 bg-background transition-colors border-b",
        isSelected && "bg-amber/10 border-l-2 border-l-amber",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{ backgroundColor: stop.marker_color }}
      >
        {index + 1}
      </div>

      <button
        className="flex-1 text-left min-w-0"
        onClick={() => onSelect(stop.id)}
      >
        <p className="font-medium text-sm truncate">{stop.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{stop.estimated_time_minutes} min</span>
        </div>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(stop.id);
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
