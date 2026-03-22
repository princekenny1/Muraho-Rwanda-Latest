import { Edit, Trash2, Layers, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Exhibition } from "@/hooks/useExhibitions";

interface ExhibitionAdminCardProps {
  exhibition: Exhibition;
  onEdit: () => void;
  onDelete: () => void;
  onManagePanels: () => void;
}

export function ExhibitionAdminCard({
  exhibition,
  onEdit,
  onDelete,
  onManagePanels,
}: ExhibitionAdminCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">
              {exhibition.title}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              {exhibition.is_permanent && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Permanent
                </Badge>
              )}
            </div>
          </div>
          {exhibition.image_url && (
            <img
              src={exhibition.image_url}
              alt={exhibition.title}
              className="w-16 h-16 object-cover rounded-lg ml-3"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {exhibition.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {exhibition.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onManagePanels}>
            <Layers className="w-4 h-4 mr-1" />
            Panels
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
