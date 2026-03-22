import { useState } from "react";
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
import { GripVertical, Trash2, Pencil, Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  useMuseumPanelBlocks,
  usePanelBlockMutations,
  MuseumPanelBlock,
  MuseumPanel,
} from "@/hooks/useMuseumAdmin";
import { BlockTypeMenu, BlockType, getBlockIcon, getBlockLabel } from "./BlockTypeMenu";
import { BlockEditorForm, BlockPreview } from "./BlockEditorForms";

interface PanelBlockEditorProps {
  panel: MuseumPanel;
}

interface SortableBlockProps {
  block: MuseumPanelBlock;
  onEdit: (block: MuseumPanelBlock) => void;
  onDelete: (block: MuseumPanelBlock) => void;
}

function SortableBlock({ block, onEdit, onDelete }: SortableBlockProps) {
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
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="gap-1.5">
            {getBlockIcon(block.block_type)}
            {getBlockLabel(block.block_type)}
          </Badge>
        </div>
        <BlockPreview type={block.block_type} content={block.content} />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onEdit(block)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Block</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this {getBlockLabel(block.block_type).toLowerCase()} block?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(block)}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function PanelBlockEditor({ panel }: PanelBlockEditorProps) {
  const { data: blocks = [], isLoading } = useMuseumPanelBlocks(panel.id);
  const { createBlock, updateBlock, deleteBlock, reorderBlocks } = usePanelBlockMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlock, setEditingBlock] = useState<MuseumPanelBlock | null>(null);
  const [blockType, setBlockType] = useState<BlockType>("text");
  const [blockContent, setBlockContent] = useState<Record<string, any>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddBlock = (type: BlockType) => {
    setEditingBlock(null);
    setBlockType(type);
    setBlockContent({});
    setIsEditing(true);
  };

  const handleEditBlock = (block: MuseumPanelBlock) => {
    setEditingBlock(block);
    setBlockType(block.block_type as BlockType);
    setBlockContent(block.content || {});
    setIsEditing(true);
  };

  const handleSaveBlock = async () => {
    if (editingBlock) {
      await updateBlock.mutateAsync({
        id: editingBlock.id,
        content: blockContent,
      });
    } else {
      await createBlock.mutateAsync({
        panel_id: panel.id,
        block_type: blockType,
        block_order: blocks.length + 1,
        content: blockContent,
      });
    }
    setIsEditing(false);
  };

  const handleDeleteBlock = async (block: MuseumPanelBlock) => {
    await deleteBlock.mutateAsync({ id: block.id, panelId: panel.id });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(blocks, oldIndex, newIndex);
      
      // Optimistically update and save
      const updates = reordered.map((block, index) => ({
        id: block.id,
        block_order: index + 1,
      }));

      await reorderBlocks.mutateAsync({ blocks: updates, panelId: panel.id });
    }
  };

  const isBlockValid = () => {
    switch (blockType) {
      case "text":
        return !!blockContent.text?.trim();
      case "image":
        return !!blockContent.url?.trim();
      case "video":
        return !!blockContent.url?.trim();
      case "audio":
        return !!blockContent.url?.trim() && !!blockContent.title?.trim();
      case "quote":
        return !!blockContent.text?.trim();
      default:
        return false;
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Content Blocks
            </CardTitle>
            <CardDescription>
              Drag to reorder blocks within this panel
            </CardDescription>
          </div>
          <BlockTypeMenu onAddBlock={handleAddBlock} />
        </CardHeader>
        <CardContent>
          {blocks.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium">No content blocks yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add text, images, videos, audio, or quotes to this panel
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      onEdit={handleEditBlock}
                      onDelete={handleDeleteBlock}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Block Editor Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {getBlockIcon(blockType)}
              {editingBlock ? `Edit ${getBlockLabel(blockType)} Block` : `Add ${getBlockLabel(blockType)} Block`}
            </SheetTitle>
            <SheetDescription>
              {editingBlock ? "Update the block content" : "Configure the new content block"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <BlockEditorForm
              type={blockType}
              content={blockContent}
              onChange={setBlockContent}
            />
            <Button
              className="w-full"
              onClick={handleSaveBlock}
              disabled={!isBlockValid() || createBlock.isPending || updateBlock.isPending}
            >
              {createBlock.isPending || updateBlock.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingBlock ? (
                "Update Block"
              ) : (
                "Add Block"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
