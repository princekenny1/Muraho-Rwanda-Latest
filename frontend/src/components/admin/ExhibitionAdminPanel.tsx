import { useState } from "react";
import { Plus, ArrowLeft, Search, Layers, Trash2, Edit, GripVertical } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useExhibitions, useExhibitionPanels, usePanelBlocks } from "@/hooks/useExhibitions";
import { useExhibitionAdmin } from "@/hooks/useExhibitionAdmin";
import { ExhibitionForm } from "./ExhibitionForm";
import { ExhibitionAdminCard } from "./museum/ExhibitionAdminCard";
import { PanelForm } from "./PanelForm";
import { PanelBlockForm } from "./PanelBlockForm";
import type { Exhibition, ExhibitionPanel, PanelBlock } from "@/hooks/useExhibitions";
// Inline Json type (replaces legacy type imports)
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type ViewMode = "exhibitions" | "panels" | "blocks";

// Sortable Panel Item Component
function SortablePanelItem({
  panel,
  onManageBlocks,
  onEdit,
  onDelete,
}: {
  panel: ExhibitionPanel;
  onManageBlocks: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: panel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="hover:shadow-sm transition-shadow">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-muted"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            <Badge variant="outline">#{panel.panel_number}</Badge>
            <CardTitle className="text-base">{panel.title}</CardTitle>
            {panel.section_label && (
              <Badge variant="secondary">{panel.section_label}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onManageBlocks}>
              <Layers className="w-4 h-4 mr-1" />
              Blocks
            </Button>
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 text-sm text-muted-foreground">
        Duration: {panel.duration_minutes} min
      </CardContent>
    </Card>
  );
}

// Sortable Block Item Component
function SortableBlockItem({
  block,
  onEdit,
  onDelete,
}: {
  block: PanelBlock;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="hover:shadow-sm transition-shadow">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-muted"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            <Badge variant="outline">#{block.block_order}</Badge>
            <Badge>{block.block_type}</Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 text-sm text-muted-foreground line-clamp-2">
        {JSON.stringify(block.content).slice(0, 100)}...
      </CardContent>
    </Card>
  );
}

export function ExhibitionAdminPanel() {
  const [viewMode, setViewMode] = useState<ViewMode>("exhibitions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<ExhibitionPanel | null>(null);

  // Form states
  const [exhibitionFormOpen, setExhibitionFormOpen] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [panelFormOpen, setPanelFormOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<ExhibitionPanel | null>(null);
  const [blockFormOpen, setBlockFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PanelBlock | null>(null);

  // Delete states
  const [deleteExhibitionId, setDeleteExhibitionId] = useState<string | null>(null);
  const [deletePanelId, setDeletePanelId] = useState<string | null>(null);
  const [deleteBlockId, setDeleteBlockId] = useState<string | null>(null);

  const { data: exhibitions = [], isLoading: exhibitionsLoading } = useExhibitions();
  const { data: panels = [] } = useExhibitionPanels(selectedExhibition?.id);
  const { data: blocks = [] } = usePanelBlocks(selectedPanel?.id);

  const {
    createExhibition,
    updateExhibition,
    deleteExhibition,
    createPanel,
    updatePanel,
    deletePanel,
    reorderPanels,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  } = useExhibitionAdmin();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredExhibitions = exhibitions.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Exhibition handlers
  const handleCreateExhibition = () => {
    setEditingExhibition(null);
    setExhibitionFormOpen(true);
  };

  const handleEditExhibition = (exhibition: Exhibition) => {
    setEditingExhibition(exhibition);
    setExhibitionFormOpen(true);
  };

  const handleExhibitionSubmit = (data: { title: string; description?: string; is_permanent?: boolean; image_url?: string }) => {
    if (editingExhibition) {
      updateExhibition.mutate({ id: editingExhibition.id, ...data }, {
        onSuccess: () => setExhibitionFormOpen(false),
      });
    } else {
      createExhibition.mutate(data, {
        onSuccess: () => setExhibitionFormOpen(false),
      });
    }
  };

  const handleConfirmDeleteExhibition = () => {
    if (deleteExhibitionId) {
      deleteExhibition.mutate(deleteExhibitionId, {
        onSuccess: () => setDeleteExhibitionId(null),
      });
    }
  };

  const handleManagePanels = (exhibition: Exhibition) => {
    setSelectedExhibition(exhibition);
    setViewMode("panels");
  };

  // Panel handlers
  const handleCreatePanel = () => {
    setEditingPanel(null);
    setPanelFormOpen(true);
  };

  const handleEditPanel = (panel: ExhibitionPanel) => {
    setEditingPanel(panel);
    setPanelFormOpen(true);
  };

  const handlePanelSubmit = (data: { title: string; panel_number: number; section_label?: string; duration_minutes?: number }) => {
    if (editingPanel) {
      updatePanel.mutate({ id: editingPanel.id, ...data }, {
        onSuccess: () => setPanelFormOpen(false),
      });
    } else if (selectedExhibition) {
      createPanel.mutate({ exhibition_id: selectedExhibition.id, ...data }, {
        onSuccess: () => setPanelFormOpen(false),
      });
    }
  };

  const handleConfirmDeletePanel = () => {
    if (deletePanelId) {
      deletePanel.mutate(deletePanelId, {
        onSuccess: () => setDeletePanelId(null),
      });
    }
  };

  const handlePanelDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = panels.findIndex((p) => p.id === active.id);
      const newIndex = panels.findIndex((p) => p.id === over.id);
      const reorderedPanels = arrayMove(panels, oldIndex, newIndex);
      
      // Update panel_number values based on new positions
      const updates = reorderedPanels.map((panel, index) => ({
        id: panel.id,
        panel_number: index + 1,
      }));
      
      reorderPanels.mutate(updates);
    }
  };

  const handleManageBlocks = (panel: ExhibitionPanel) => {
    setSelectedPanel(panel);
    setViewMode("blocks");
  };

  // Block handlers
  const handleCreateBlock = () => {
    setEditingBlock(null);
    setBlockFormOpen(true);
  };

  const handleEditBlock = (block: PanelBlock) => {
    setEditingBlock(block);
    setBlockFormOpen(true);
  };

  const handleBlockSubmit = (data: { block_type: string; block_order: number; content: Record<string, unknown> }) => {
    if (editingBlock) {
      updateBlock.mutate({ 
        id: editingBlock.id, 
        block_type: data.block_type,
        block_order: data.block_order,
        content: data.content as Json,
      }, {
        onSuccess: () => setBlockFormOpen(false),
      });
    } else if (selectedPanel) {
      createBlock.mutate({
        panel_id: selectedPanel.id,
        block_type: data.block_type,
        block_order: data.block_order,
        content: data.content as Json,
      }, {
        onSuccess: () => setBlockFormOpen(false),
      });
    }
  };

  const handleConfirmDeleteBlock = () => {
    if (deleteBlockId) {
      deleteBlock.mutate(deleteBlockId, {
        onSuccess: () => setDeleteBlockId(null),
      });
    }
  };

  const handleBlockDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex);
      
      // Update block_order values based on new positions
      const updates = reorderedBlocks.map((block, index) => ({
        id: block.id,
        block_order: index + 1,
      }));
      
      reorderBlocks.mutate(updates);
    }
  };

  const handleBack = () => {
    if (viewMode === "blocks") {
      setSelectedPanel(null);
      setViewMode("panels");
    } else if (viewMode === "panels") {
      setSelectedExhibition(null);
      setViewMode("exhibitions");
    }
  };

  // Render exhibitions list
  if (viewMode === "exhibitions") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exhibitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleCreateExhibition}>
            <Plus className="h-4 w-4 mr-2" />
            New Exhibition
          </Button>
        </div>

        {exhibitionsLoading ? (
          <p className="text-muted-foreground">Loading exhibitions...</p>
        ) : filteredExhibitions.length === 0 ? (
          <p className="text-muted-foreground">No exhibitions found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExhibitions.map((exhibition) => (
              <ExhibitionAdminCard
                key={exhibition.id}
                exhibition={exhibition}
                onEdit={() => handleEditExhibition(exhibition)}
                onDelete={() => setDeleteExhibitionId(exhibition.id)}
                onManagePanels={() => handleManagePanels(exhibition)}
              />
            ))}
          </div>
        )}

        <ExhibitionForm
          exhibition={editingExhibition}
          open={exhibitionFormOpen}
          onOpenChange={setExhibitionFormOpen}
          onSubmit={handleExhibitionSubmit}
          isLoading={createExhibition.isPending || updateExhibition.isPending}
        />

        <AlertDialog open={!!deleteExhibitionId} onOpenChange={() => setDeleteExhibitionId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Exhibition?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the exhibition and all its panels and blocks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteExhibition}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Render panels list with drag-and-drop
  if (viewMode === "panels" && selectedExhibition) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{selectedExhibition.title}</h2>
            <p className="text-sm text-muted-foreground">Drag to reorder panels</p>
          </div>
          <Button onClick={handleCreatePanel} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Panel
          </Button>
        </div>

        {panels.length === 0 ? (
          <p className="text-muted-foreground">No panels yet.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handlePanelDragEnd}
          >
            <SortableContext
              items={panels.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {panels.map((panel) => (
                  <SortablePanelItem
                    key={panel.id}
                    panel={panel}
                    onManageBlocks={() => handleManageBlocks(panel)}
                    onEdit={() => handleEditPanel(panel)}
                    onDelete={() => setDeletePanelId(panel.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <PanelForm
          panel={editingPanel}
          defaultPanelNumber={panels.length + 1}
          open={panelFormOpen}
          onOpenChange={setPanelFormOpen}
          onSubmit={handlePanelSubmit}
          isLoading={createPanel.isPending || updatePanel.isPending}
        />

        <AlertDialog open={!!deletePanelId} onOpenChange={() => setDeletePanelId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Panel?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the panel and all its content blocks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeletePanel}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Render blocks list with drag-and-drop
  if (viewMode === "blocks" && selectedPanel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Panel #{selectedPanel.panel_number}: {selectedPanel.title}</h2>
            <p className="text-sm text-muted-foreground">Drag to reorder blocks</p>
          </div>
          <Button onClick={handleCreateBlock} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Block
          </Button>
        </div>

        {blocks.length === 0 ? (
          <p className="text-muted-foreground">No blocks yet.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleBlockDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {blocks.map((block) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    onEdit={() => handleEditBlock(block)}
                    onDelete={() => setDeleteBlockId(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <PanelBlockForm
          block={editingBlock}
          defaultBlockOrder={blocks.length + 1}
          open={blockFormOpen}
          onOpenChange={setBlockFormOpen}
          onSubmit={handleBlockSubmit}
          isLoading={createBlock.isPending || updateBlock.isPending}
        />

        <AlertDialog open={!!deleteBlockId} onOpenChange={() => setDeleteBlockId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Block?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this content block.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteBlock}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return null;
}
