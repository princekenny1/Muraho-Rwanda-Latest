import { useState } from "react";
import { Download, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/client";
import type { VRScene } from "@/hooks/useVRScenes";

type HotspotType = "info" | "navigation" | "media" | "link";

interface VRBulkActionsProps {
  museumId: string;
  scenes: VRScene[];
  onImportComplete: () => void;
}

interface ExportHotspot {
  type: string;
  title: string;
  description: string | null;
  position_x: number;
  position_y: number;
  content: Json | null;
  target_scene_id: string | null;
  is_active: boolean;
}

interface ExportScene {
  museum_id: string;
  title: string;
  description: string | null;
  panorama_url: string;
  scene_order: number;
  narration_text: string | null;
  narration_audio_url: string | null;
  is_active: boolean;
  hotspots: ExportHotspot[];
}

interface ExportData {
  version: string;
  exportedAt: string;
  museumId: string;
  scenes: ExportScene[];
}

export function VRBulkActions({ museumId, scenes, onImportComplete }: VRBulkActionsProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ExportData | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all hotspots for all scenes
      const hotspotsRes = await api.find("vr-hotspots", {
        where: { scene: { in: scenes.map((s) => s.id).join(",") } },
        limit: 500,
      });
      const allHotspots = hotspotsRes.docs;

      // Build export structure
      const exportData: ExportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        museumId,
        scenes: scenes.map((scene) => ({
          museum_id: scene.museum_id,
          title: scene.title,
          description: scene.description,
          panorama_url: scene.panorama_url,
          scene_order: scene.scene_order,
          narration_text: scene.narration_text,
          narration_audio_url: scene.narration_audio_url,
          is_active: scene.is_active,
          hotspots: (allHotspots || [])
            .filter((h) => h.scene_id === scene.id)
            .map((h) => ({
              type: h.type as string,
              title: h.title,
              description: h.description,
              position_x: Number(h.position_x),
              position_y: Number(h.position_y),
              content: h.content,
              target_scene_id: h.target_scene_id,
              is_active: h.is_active,
            })),
        })),
      };

      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vr-tour-${museumId}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "Export successful", description: `${scenes.length} scenes exported` });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      // Validate structure
      if (!data.version || !data.scenes || !Array.isArray(data.scenes)) {
        throw new Error("Invalid file format");
      }

      setImportPreview(data);
      setImportDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Invalid file",
        description: error.message,
        variant: "destructive",
      });
    }

    // Reset input
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!importPreview) return;

    setImporting(true);
    try {
      const sceneIdMap: Record<number, string> = {};

      // Import scenes one by one to maintain order and get IDs
      for (let i = 0; i < importPreview.scenes.length; i++) {
        const scene = importPreview.scenes[i];
        const newScene = await api.create("vr-scenes", {
            museumId: museumId,
            title: scene.title,
            description: scene.description,
            panoramaUrl: scene.panorama_url,
            sceneOrder: scene.scene_order,
            narrationText: scene.narration_text,
            narrationAudioUrl: scene.narration_audio_url,
            isActive: scene.is_active,
          }) as { id: string };

        sceneIdMap[i] = newScene.id;
      }

      // Import hotspots for each scene
      for (let i = 0; i < importPreview.scenes.length; i++) {
        const scene = importPreview.scenes[i];
        const sceneId = sceneIdMap[i];

        if (scene.hotspots && scene.hotspots.length > 0) {
          await Promise.all(
            scene.hotspots.map((h) =>
              api.create("vr-hotspots", {
                scene: sceneId,
                type: h.type as HotspotType,
                title: h.title,
                description: h.description,
                positionX: h.position_x,
                positionY: h.position_y,
                content: h.content,
                targetSceneId: h.target_scene_id,
                isActive: h.is_active,
              })
            )
          );
        }
      }

      toast({
        title: "Import successful",
        description: `${importPreview.scenes.length} scenes imported`,
      });
      setImportDialogOpen(false);
      setImportPreview(null);
      onImportComplete();
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const totalHotspots = importPreview?.scenes.reduce(
    (sum, s) => sum + (s.hotspots?.length || 0),
    0
  ) || 0;

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting || scenes.length === 0}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export JSON
        </Button>

        <Button variant="outline" size="sm" asChild>
          <label className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Import JSON
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </Button>
      </div>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Import</DialogTitle>
            <DialogDescription>
              This will add new scenes and hotspots to your tour. Existing scenes will not be
              affected.
            </DialogDescription>
          </DialogHeader>

          {importPreview && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm">
                  <strong>Scenes:</strong> {importPreview.scenes.length}
                </p>
                <p className="text-sm">
                  <strong>Total Hotspots:</strong> {totalHotspots}
                </p>
                <p className="text-sm text-muted-foreground">
                  Exported: {new Date(importPreview.exportedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setImportDialogOpen(false)}
                  disabled={importing}
                >
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
