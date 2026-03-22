import { useState } from "react";
import { Plus, LayoutGrid, GripVertical, Trash2, Pencil, Loader2, ChevronRight, ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useMuseumPanels,
  useMuseumPanelBlocks,
  usePanelMutations,
  MuseumPanel,
  MuseumRoom,
} from "@/hooks/useMuseumAdmin";
import { PanelBlockEditor } from "./blocks";

interface MuseumPanelsTabProps {
  room: MuseumRoom;
}

export function MuseumPanelsTab({ room }: MuseumPanelsTabProps) {
  const { data: panels = [], isLoading } = useMuseumPanels(room.id);
  const { createPanel, updatePanel, deletePanel } = usePanelMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [editingPanel, setEditingPanel] = useState<MuseumPanel | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<MuseumPanel | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    panel_number: "",
    notes: "",
    auto_resize: true,
    allow_swipe_gallery: true,
    text_flow_optimization: true,
  });

  const handleOpenCreate = () => {
    setEditingPanel(null);
    setFormData({
      title: "",
      panel_number: "",
      notes: "",
      auto_resize: true,
      allow_swipe_gallery: true,
      text_flow_optimization: true,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (panel: MuseumPanel) => {
    setEditingPanel(panel);
    setFormData({
      title: panel.title,
      panel_number: panel.panel_number || "",
      notes: panel.notes || "",
      auto_resize: panel.auto_resize,
      allow_swipe_gallery: panel.allow_swipe_gallery,
      text_flow_optimization: panel.text_flow_optimization,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editingPanel) {
      await updatePanel.mutateAsync({
        id: editingPanel.id,
        ...formData,
      });
    } else {
      const newOrder = panels.length + 1;
      await createPanel.mutateAsync({
        room_id: room.id,
        panel_order: newOrder,
        ...formData,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async (panel: MuseumPanel) => {
    await deletePanel.mutateAsync({ id: panel.id, roomId: room.id });
    if (selectedPanel?.id === panel.id) {
      setSelectedPanel(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // If a panel is selected, show the block editor
  if (selectedPanel) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedPanel(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Panels
          </Button>
          <div>
            <h2 className="font-semibold">{selectedPanel.title}</h2>
            <p className="text-sm text-muted-foreground">
              Panel {selectedPanel.panel_number || selectedPanel.panel_order}
            </p>
          </div>
        </div>
        <PanelBlockEditor panel={selectedPanel} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Panels in {room.name}</CardTitle>
            <CardDescription>
              Click a panel to edit its content blocks
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Panel
          </Button>
        </CardHeader>
        <CardContent>
          {panels.length === 0 ? (
            <div className="text-center py-12">
              <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium">No panels yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add panels to this room
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {panels.map((panel, index) => (
                <PanelListItem
                  key={panel.id}
                  panel={panel}
                  index={index}
                  onSelect={() => setSelectedPanel(panel)}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingPanel ? "Edit Panel" : "Add Panel"}</SheetTitle>
            <SheetDescription>
              {editingPanel ? "Update the panel details" : "Create a new exhibition panel"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Panel Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Events Unfolding"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panel_number">Panel Number</Label>
              <Input
                id="panel_number"
                value={formData.panel_number}
                onChange={(e) =>
                  setFormData({ ...formData, panel_number: e.target.value })
                }
                placeholder="e.g., 2.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (internal only)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes about this panel..."
                rows={3}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Mobile Optimization</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto_resize">Auto-resize panels</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically resize large panels for mobile
                  </p>
                </div>
                <Switch
                  id="auto_resize"
                  checked={formData.auto_resize}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, auto_resize: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="swipe">Allow swipe gallery</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable swipeable image galleries
                  </p>
                </div>
                <Switch
                  id="swipe"
                  checked={formData.allow_swipe_gallery}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allow_swipe_gallery: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="text_flow">Text flow optimization</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize text layout for readability
                  </p>
                </div>
                <Switch
                  id="text_flow"
                  checked={formData.text_flow_optimization}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, text_flow_optimization: checked })
                  }
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={!formData.title.trim() || createPanel.isPending || updatePanel.isPending}
              >
                {createPanel.isPending || updatePanel.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingPanel ? (
                  "Update Panel"
                ) : (
                  "Create Panel"
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Extracted panel list item for block count badge
function PanelListItem({
  panel,
  index,
  onSelect,
  onEdit,
  onDelete,
}: {
  panel: MuseumPanel;
  index: number;
  onSelect: () => void;
  onEdit: (panel: MuseumPanel) => void;
  onDelete: (panel: MuseumPanel) => void;
}) {
  const { data: blocks = [] } = useMuseumPanelBlocks(panel.id);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <GripVertical className="h-5 w-5 cursor-grab" />
        <span className="text-sm font-medium w-6">
          {panel.panel_number || index + 1}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{panel.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs gap-1">
            <Layers className="h-3 w-3" />
            {blocks.length} block{blocks.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(panel);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Panel</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{panel.title}"? All content
                blocks in this panel will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(panel)}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
}
