import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimony } from "@/hooks/useTestimonies";

interface TestimonyAdminCardProps {
  testimony: Testimony;
  onEdit: (testimony: Testimony) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (testimony: Testimony) => void;
}

const categoryColors: Record<string, string> = {
  survivor: "bg-muted-indigo text-white",
  rescuer: "bg-adventure-green text-midnight",
  witness: "bg-terracotta text-white",
  reconciliation: "bg-forest-teal text-white",
};

export function TestimonyAdminCard({
  testimony,
  onEdit,
  onDelete,
  onToggleFeatured,
}: TestimonyAdminCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimony.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="group">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={testimony.cover_image}
              alt={testimony.person_name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{testimony.person_name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {testimony.title}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge
                  variant="secondary"
                  className={categoryColors[testimony.category] || ""}
                >
                  {testimony.category}
                </Badge>
                {testimony.is_featured && (
                  <Star className="h-4 w-4 text-amber fill-amber" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              {testimony.location && <span>{testimony.location}</span>}
              {testimony.year && <span>• {testimony.year}</span>}
              {testimony.duration_minutes && (
                <span>• {testimony.duration_minutes} min</span>
              )}
              {testimony.has_content_warning && (
                <Badge variant="outline" className="text-xs">
                  ⚠️ Content Warning
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFeatured(testimony)}
              title={testimony.is_featured ? "Remove from featured" : "Feature"}
            >
              <Star
                className={`h-4 w-4 ${
                  testimony.is_featured ? "fill-amber text-amber" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(testimony)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(testimony.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
