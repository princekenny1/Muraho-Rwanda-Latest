import { useState, useEffect } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, ExternalLink } from "lucide-react";
import { VRBulkActions } from "./VRBulkActions";
import { Button } from "@/components/ui/button";
import { useVRScenes, type VRScene } from "@/hooks/useVRScenes";
import { useVRAdmin } from "@/hooks/useVRAdmin";
import { VRSceneCard } from "./VRSceneCard";
import { VRSceneForm } from "./VRSceneForm";
import { VRHotspotManager } from "./VRHotspotManager";
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

interface VRAdminPanelProps {
  museumId: string;
}

const EMPTY_SCENES: VRScene[] = [];

export function VRAdminPanel({ museumId }: VRAdminPanelProps) {
  const { toast } = useToast();
  const { data: scenes = EMPTY_SCENES, isLoading } = useVRScenes(
    museumId,
    true,
  ); // Include inactive scenes for admin
  const { createScene, updateScene, deleteScene, reorderScenes } =
    useVRAdmin(museumId);

  const [localScenes, setLocalScenes] = useState<VRScene[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<VRScene | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [managingHotspotsFor, setManagingHotspotsFor] =
    useState<VRScene | null>(null);

  // Track hotspot counts for each scene
  const [hotspotCounts, setHotspotCounts] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    setLocalScenes(scenes);
  }, [scenes]);

  // Fetch hotspot counts for all scenes
  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      for (const scene of scenes) {
        // We'll use the hook data directly when available
        counts[scene.id] = 0;
      }
      setHotspotCounts(counts);
    };
    fetchCounts();
  }, [scenes]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localScenes.findIndex((s) => s.id === active.id);
      const newIndex = localScenes.findIndex((s) => s.id === over.id);

      const reordered = arrayMove(localScenes, oldIndex, newIndex);
      setLocalScenes(reordered);

      // Update scene orders
      const updates = reordered.map((scene, index) => ({
        id: scene.id,
        scene_order: index + 1,
      }));

      try {
        await reorderScenes.mutateAsync(updates);
        toast({ title: "Scenes reordered" });
      } catch (error: any) {
        toast({
          title: "Error reordering scenes",
          description: error.message,
          variant: "destructive",
        });
        setLocalScenes(scenes); // Revert on error
      }
    }
  };

  const handleAddScene = () => {
    setEditingScene(null);
    setFormOpen(true);
  };

  const handleEditScene = (scene: VRScene) => {
    setEditingScene(scene);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingScene) {
        await updateScene.mutateAsync({
          id: editingScene.id,
          ...values,
        });
        toast({ title: "Scene updated successfully" });
      } else {
        await createScene.mutateAsync({
          museum_id: museumId,
          scene_order: localScenes.length + 1,
          ...values,
        });
        toast({ title: "Scene added successfully" });
      }
      setFormOpen(false);
    } catch (error: any) {
      toast({
        title: "Error saving scene",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (scene: VRScene) => {
    try {
      await updateScene.mutateAsync({
        id: scene.id,
        is_active: !scene.is_active,
      });
      toast({
        title: scene.is_active ? "Scene hidden" : "Scene visible",
      });
    } catch (error: any) {
      toast({
        title: "Error updating scene",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteScene = async () => {
    if (!deleteId) return;
    try {
      await deleteScene.mutateAsync(deleteId);
      toast({ title: "Scene deleted" });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: "Error deleting scene",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (managingHotspotsFor) {
    return (
      <VRHotspotManager
        scene={managingHotspotsFor}
        allScenes={scenes}
        onBack={() => setManagingHotspotsFor(null)}
        museumId={museumId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Virtual Tour Scenes</h2>
          <p className="text-sm text-muted-foreground">
            Drag to reorder scenes. Click to edit or manage hotspots.
          </p>
        </div>
        <div className="flex gap-2">
          <VRBulkActions
            museumId={museumId}
            scenes={localScenes}
            onImportComplete={() => {
              // Query will auto-refetch
            }}
          />
          <Button
            variant="outline"
            onClick={() =>
              window.open(`/museum-guide?tab=virtual-tour`, "_blank")
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview Tour
          </Button>
          <Button onClick={handleAddScene}>
            <Plus className="h-4 w-4 mr-2" />
            Add Scene
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading scenes...</p>
      ) : localScenes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No scenes yet. Add your first VR scene to get started.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localScenes.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {localScenes.map((scene) => (
                <VRSceneCard
                  key={scene.id}
                  scene={scene}
                  hotspotCount={hotspotCounts[scene.id] ?? 0}
                  onEdit={handleEditScene}
                  onDelete={(id) => setDeleteId(id)}
                  onToggleActive={handleToggleActive}
                  onManageHotspots={setManagingHotspotsFor}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <VRSceneForm
        open={formOpen}
        onOpenChange={setFormOpen}
        scene={editingScene}
        onSubmit={handleFormSubmit}
        isLoading={createScene.isPending || updateScene.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scene?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the scene and all its hotspots. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteScene}
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
