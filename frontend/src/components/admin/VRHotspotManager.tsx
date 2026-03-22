import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVRHotspots, type VRScene, type VRHotspot } from "@/hooks/useVRScenes";
import { useVRAdmin } from "@/hooks/useVRAdmin";
import { VRHotspotForm } from "./VRHotspotForm";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VRHotspotManagerProps {
  scene: VRScene;
  allScenes: VRScene[];
  onBack: () => void;
  museumId: string;
}

const typeColors: Record<string, string> = {
  info: "bg-blue-500",
  audio: "bg-green-500",
  video: "bg-purple-500",
  "next-scene": "bg-amber-500",
  landmark: "bg-rose-500",
};

export function VRHotspotManager({
  scene,
  allScenes,
  onBack,
  museumId,
}: VRHotspotManagerProps) {
  const { toast } = useToast();
  const { data: hotspots = [], isLoading } = useVRHotspots(scene.id);
  const { createHotspot, updateHotspot, deleteHotspot } = useVRAdmin(museumId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<VRHotspot | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingHotspot(null);
    setFormOpen(true);
  };

  const handleEdit = (hotspot: VRHotspot) => {
    setEditingHotspot(hotspot);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    const content: Record<string, string | number | boolean> = {};
    if (values.audio_url) content.audioUrl = values.audio_url;
    if (values.video_url) content.videoUrl = values.video_url;
    if (values.duration) content.duration = values.duration;

    try {
      if (editingHotspot) {
        await updateHotspot.mutateAsync({
          id: editingHotspot.id,
          scene_id: scene.id,
          title: values.title,
          description: values.description || null,
          type: values.type,
          position_x: values.position_x,
          position_y: values.position_y,
          target_scene_id: values.target_scene_id || null,
          content: Object.keys(content).length > 0 ? content : null,
        });
        toast({ title: "Hotspot updated successfully" });
      } else {
        await createHotspot.mutateAsync({
          scene_id: scene.id,
          title: values.title,
          description: values.description || null,
          type: values.type,
          position_x: values.position_x,
          position_y: values.position_y,
          target_scene_id: values.target_scene_id || null,
          content: Object.keys(content).length > 0 ? content : undefined,
        });
        toast({ title: "Hotspot added successfully" });
      }
      setFormOpen(false);
    } catch (error: any) {
      toast({
        title: "Error saving hotspot",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHotspot.mutateAsync({ hotspotId: deleteId, sceneId: scene.id });
      toast({ title: "Hotspot deleted" });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: "Error deleting hotspot",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scenes
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/museum-guide?tab=virtual-tour`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Hotspot
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">{scene.title}</h2>
        <p className="text-sm text-muted-foreground">Manage hotspots for this scene</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading hotspots...</p>
      ) : hotspots.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hotspots yet. Add one to make this scene interactive.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hotspots.map((hotspot) => (
            <Card key={hotspot.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${typeColors[hotspot.type]}`}
                    />
                    <CardTitle className="text-base">{hotspot.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {hotspot.type.replace("-", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {hotspot.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {hotspot.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mb-3">
                  Position: ({hotspot.position_x}%, {hotspot.position_y}%)
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(hotspot)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(hotspot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VRHotspotForm
        open={formOpen}
        onOpenChange={setFormOpen}
        hotspot={editingHotspot}
        sceneId={scene.id}
        panoramaUrl={scene.panorama_url}
        availableScenes={allScenes}
        onSubmit={handleFormSubmit}
        isLoading={createHotspot.isPending || updateHotspot.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hotspot?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The hotspot will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
