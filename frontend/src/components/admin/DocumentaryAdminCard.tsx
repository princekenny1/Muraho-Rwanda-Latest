import { Edit, Trash2, Star, Clock, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Documentary } from "@/hooks/useDocumentaries";

interface DocumentaryAdminCardProps {
  documentary: Documentary;
  onEdit: (documentary: Documentary) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (documentary: Documentary) => void;
  onManageChapters: (documentary: Documentary) => void;
}

const typeColors: Record<string, string> = {
  historical: "bg-muted-indigo text-white",
  survivor: "bg-terracotta text-white",
  cultural: "bg-adventure-green text-midnight",
  educational: "bg-forest-teal text-white",
};

export function DocumentaryAdminCard({
  documentary,
  onEdit,
  onDelete,
  onToggleFeatured,
  onManageChapters,
}: DocumentaryAdminCardProps) {
  const formatRuntime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={documentary.cover_image}
              alt={documentary.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{documentary.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {documentary.director ? `Dir. ${documentary.director}` : "No director"} • {documentary.year}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge
                  variant="secondary"
                  className={typeColors[documentary.type] || ""}
                >
                  {documentary.type}
                </Badge>
                {documentary.is_featured && (
                  <Star className="h-4 w-4 text-amber fill-amber" />
                )}
                {documentary.is_new && (
                  <Badge variant="outline" className="text-xs">NEW</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRuntime(documentary.runtime)}
              </span>
              <span className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                {documentary.chapters_count || 0} chapters
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFeatured(documentary)}
              title={documentary.is_featured ? "Remove from featured" : "Feature"}
            >
              <Star
                className={`h-4 w-4 ${
                  documentary.is_featured ? "fill-amber text-amber" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onManageChapters(documentary)}
            >
              Chapters
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(documentary)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(documentary.id)}
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
