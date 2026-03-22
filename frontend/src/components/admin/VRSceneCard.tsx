import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Eye, EyeOff, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VRScene } from "@/hooks/useVRScenes";

interface VRSceneCardProps {
  scene: VRScene;
  hotspotCount: number;
  onEdit: (scene: VRScene) => void;
  onDelete: (sceneId: string) => void;
  onToggleActive: (scene: VRScene) => void;
  onManageHotspots: (scene: VRScene) => void;
}

export function VRSceneCard({
  scene,
  hotspotCount,
  onEdit,
  onDelete,
  onToggleActive,
  onManageHotspots,
}: VRSceneCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative ${!scene.is_active ? "opacity-60" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                #{scene.scene_order}
              </Badge>
              {!scene.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Hidden
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg truncate">{scene.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {scene.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {scene.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            {hotspotCount} hotspot{hotspotCount !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onManageHotspots(scene)}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Hotspots
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(scene)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleActive(scene)}
          >
            {scene.is_active ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(scene.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
