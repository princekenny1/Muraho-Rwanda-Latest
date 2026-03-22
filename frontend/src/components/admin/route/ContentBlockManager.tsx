import { useState } from "react";
import { Plus, GripVertical, Trash2, Type, Image, Video, Volume2, Quote, Lightbulb, Link2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useStopContentBlocks } from "@/hooks/useRouteAdmin";
import { MediaUpload } from "./MediaUpload";
import type { 
  StopContentBlock, 
  ContentBlockType, 
  ContentBlockData,
  TextBlockContent,
  ImageBlockContent,
  VideoBlockContent,
  AudioBlockContent,
  QuoteBlockContent,
  FactBlockContent,
} from "@/types/routes";

interface ContentBlockManagerProps {
  stopId: string;
}

const blockTypeConfig: Record<ContentBlockType, { icon: typeof Type; label: string; color: string }> = {
  text: { icon: Type, label: "Text", color: "bg-blue-500" },
  image: { icon: Image, label: "Image", color: "bg-green-500" },
  video: { icon: Video, label: "Video", color: "bg-purple-500" },
  audio: { icon: Volume2, label: "Audio", color: "bg-amber-500" },
  quote: { icon: Quote, label: "Quote", color: "bg-pink-500" },
  fact: { icon: Lightbulb, label: "Fact", color: "bg-yellow-500" },
  story_link: { icon: Link2, label: "Story Link", color: "bg-cyan-500" },
  testimony_link: { icon: User, label: "Testimony", color: "bg-indigo-500" },
};

export function ContentBlockManager({ stopId }: ContentBlockManagerProps) {
  const { blocks, loading, createBlock, updateBlock, deleteBlock, reorderBlocks } = useStopContentBlocks(stopId);
  const [editingBlock, setEditingBlock] = useState<StopContentBlock | null>(null);
  const [newBlockType, setNewBlockType] = useState<ContentBlockType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      reorderBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const handleAddBlock = async (type: ContentBlockType) => {
    const defaultContent = getDefaultContent(type);
    await createBlock(type, defaultContent);
  };

  const handleSaveBlock = async (content: ContentBlockData) => {
    if (editingBlock) {
      await updateBlock(editingBlock.id, content);
      setEditingBlock(null);
    } else if (newBlockType) {
      await createBlock(newBlockType, content);
      setNewBlockType(null);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading blocks...</div>;
  }

  return (
    <div className="space-y-3">
      {blocks.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((block) => (
                <SortableBlockItem
                  key={block.id}
                  block={block}
                  onEdit={() => setEditingBlock(block)}
                  onDelete={() => deleteBlock(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Add Content Block
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {Object.entries(blockTypeConfig).map(([type, config]) => (
            <DropdownMenuItem key={type} onClick={() => handleAddBlock(type as ContentBlockType)}>
              <config.icon className="h-4 w-4 mr-2" />
              {config.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Block Dialog */}
      {editingBlock && (
        <BlockEditorDialog
          block={editingBlock}
          onSave={handleSaveBlock}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  );
}

interface SortableBlockItemProps {
  block: StopContentBlock;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableBlockItem({ block, onEdit, onDelete }: SortableBlockItemProps) {
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
  };

  const config = blockTypeConfig[block.block_type];
  const Icon = config.icon;

  const getBlockPreview = () => {
    const content = block.content as ContentBlockData;
    switch (block.block_type) {
      case "text":
        return (content as TextBlockContent).text?.slice(0, 50) + "...";
      case "quote":
        return `"${(content as QuoteBlockContent).quote?.slice(0, 40)}..."`;
      case "fact":
        return (content as FactBlockContent).title || "Fact";
      case "image":
        return `${(content as ImageBlockContent).images?.length || 0} image(s)`;
      case "video":
        return (content as VideoBlockContent).url ? "Video added" : "No video";
      case "audio":
        return (content as AudioBlockContent).title || "Audio clip";
      default:
        return config.label;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-muted/50 rounded-lg ${isDragging ? "opacity-50" : ""}`}
    >
      <button className="cursor-grab" {...attributes} {...listeners}>
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      
      <div className={`w-6 h-6 rounded flex items-center justify-center ${config.color}`}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>

      <button className="flex-1 text-left min-w-0" onClick={onEdit}>
        <p className="text-xs font-medium truncate">{getBlockPreview()}</p>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

interface BlockEditorDialogProps {
  block: StopContentBlock;
  onSave: (content: ContentBlockData) => void;
  onClose: () => void;
}

function BlockEditorDialog({ block, onSave, onClose }: BlockEditorDialogProps) {
  const [content, setContent] = useState<ContentBlockData>(block.content);
  const config = blockTypeConfig[block.block_type];

  const renderEditor = () => {
    switch (block.block_type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label>Text Content</Label>
            <Textarea
              value={(content as TextBlockContent).text || ""}
              onChange={(e) => setContent({ ...content, text: e.target.value } as TextBlockContent)}
              rows={6}
              placeholder="Enter your text content..."
            />
          </div>
        );

      case "quote":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Quote</Label>
              <Textarea
                value={(content as QuoteBlockContent).quote || ""}
                onChange={(e) => setContent({ ...content, quote: e.target.value } as QuoteBlockContent)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Attribution</Label>
              <Input
                value={(content as QuoteBlockContent).attribution || ""}
                onChange={(e) => setContent({ ...content, attribution: e.target.value } as QuoteBlockContent)}
                placeholder="Who said this?"
              />
            </div>
            <div className="space-y-2">
              <Label>Year (optional)</Label>
              <Input
                value={(content as QuoteBlockContent).year || ""}
                onChange={(e) => setContent({ ...content, year: e.target.value } as QuoteBlockContent)}
                placeholder="e.g., 1994"
              />
            </div>
          </div>
        );

      case "fact":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={(content as FactBlockContent).title || ""}
                onChange={(e) => setContent({ ...content, title: e.target.value } as FactBlockContent)}
                placeholder="Did you know?"
              />
            </div>
            <div className="space-y-2">
              <Label>Fact</Label>
              <Textarea
                value={(content as FactBlockContent).fact || ""}
                onChange={(e) => setContent({ ...content, fact: e.target.value } as FactBlockContent)}
                rows={3}
              />
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Image</Label>
              <MediaUpload
                mediaType="image"
                folder="stops/images"
                value={(content as ImageBlockContent).images?.[0]?.url || ""}
                onChange={(url) => setContent({ 
                  ...content, 
                  images: [{ url: url || "", caption: (content as ImageBlockContent).images?.[0]?.caption }] 
                } as ImageBlockContent)}
              />
            </div>
            <div className="space-y-2">
              <Label>Caption (optional)</Label>
              <Input
                value={(content as ImageBlockContent).images?.[0]?.caption || ""}
                onChange={(e) => setContent({ 
                  ...content, 
                  images: [{ url: (content as ImageBlockContent).images?.[0]?.url || "", caption: e.target.value }] 
                } as ImageBlockContent)}
              />
            </div>
          </div>
        );

      case "video":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Video</Label>
              <MediaUpload
                mediaType="video"
                folder="stops/videos"
                value={(content as VideoBlockContent).url || ""}
                onChange={(url) => setContent({ ...content, url: url || "" } as VideoBlockContent)}
              />
            </div>
            <div className="space-y-2">
              <Label>Caption (optional)</Label>
              <Input
                value={(content as VideoBlockContent).caption || ""}
                onChange={(e) => setContent({ ...content, caption: e.target.value } as VideoBlockContent)}
              />
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Audio</Label>
              <MediaUpload
                mediaType="audio"
                folder="stops/audio"
                value={(content as AudioBlockContent).url || ""}
                onChange={(url) => setContent({ ...content, url: url || "" } as AudioBlockContent)}
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={(content as AudioBlockContent).title || ""}
                onChange={(e) => setContent({ ...content, title: e.target.value } as AudioBlockContent)}
              />
            </div>
            <div className="space-y-2">
              <Label>Transcript (optional)</Label>
              <Textarea
                value={(content as AudioBlockContent).transcript || ""}
                onChange={(e) => setContent({ ...content, transcript: e.target.value } as AudioBlockContent)}
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Editor for {block.block_type} coming soon...
          </div>
        );
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <config.icon className="h-5 w-5" />
            Edit {config.label} Block
          </DialogTitle>
          <DialogDescription>
            Update the content of this block
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderEditor()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(content)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultContent(type: ContentBlockType): ContentBlockData {
  switch (type) {
    case "text":
      return { text: "" };
    case "image":
      return { images: [], layout: "single" };
    case "video":
      return { url: "" };
    case "audio":
      return { url: "" };
    case "quote":
      return { quote: "", attribution: "" };
    case "fact":
      return { title: "Did you know?", fact: "" };
    case "story_link":
      return { storyId: "" };
    case "testimony_link":
      return { testimonyId: "" };
  }
}
