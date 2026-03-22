import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Save,
  Send,
  Trash2,
  GripVertical,
  Plus,
  Type,
  Image,
  Video,
  Music,
  Quote,
  Clock,
  MapPin,
  ArrowLeftRight,
  Link,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  useContentCMS,
  Story,
  StoryBlock,
  generateSlug,
} from "@/hooks/useContentCMS";
import { UniversalTagPicker } from "./UniversalTagPicker";
import { MediaUpload } from "@/components/admin/routes/MediaUpload";
import { StoryBlockEditor } from "./StoryBlockEditor";

interface StoryEditorProps {
  storyId?: string | null;
  onClose: () => void;
}

const blockTypes = [
  { type: "text", label: "Text Block", icon: Type },
  { type: "image", label: "Image", icon: Image },
  { type: "gallery", label: "Image Gallery", icon: Image },
  { type: "video", label: "Video Block", icon: Video },
  { type: "audio", label: "Audio Block", icon: Music },
  { type: "quote", label: "Quote Block", icon: Quote },
  { type: "timeline", label: "Timeline", icon: Clock },
  { type: "map", label: "Map Location", icon: MapPin },
  { type: "then_now", label: "Then & Now", icon: ArrowLeftRight },
  { type: "linked_testimony", label: "Link Testimony", icon: Link },
  { type: "linked_story", label: "Link Story", icon: Link },
];

interface SortableBlockProps {
  block: StoryBlock;
  onUpdate: (content: Record<string, any>) => void;
  onDelete: () => void;
}

function SortableBlock({ block, onUpdate, onDelete }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className="border-l-4 border-l-primary/50">
        <CardHeader className="py-3 flex flex-row items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:bg-muted p-1 rounded"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <Badge variant="secondary" className="capitalize">
            {block.block_type.replace("_", " ")}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <StoryBlockEditor
            blockType={block.block_type}
            content={block.content}
            onChange={onUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function StoryEditor({ storyId, onClose }: StoryEditorProps) {
  const { toast } = useToast();
  const cms = useContentCMS();
  const isEditing = !!storyId;

  const { data: existingStory } = cms.useStory(storyId || "");
  const { data: blocks = [], isLoading: blocksLoading } = cms.useStoryBlocks(
    storyId || "",
  );

  const [localBlocks, setLocalBlocks] = useState<StoryBlock[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);

  const form = useForm<Partial<Story>>({
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      hero_image: undefined,
      status: "draft",
      is_featured: false,
      has_sensitive_content: false,
      sensitivity_level: undefined,
    },
  });

  useEffect(() => {
    if (existingStory) {
      form.reset({
        title: existingStory.title,
        slug: existingStory.slug,
        summary: existingStory.summary || "",
        hero_image: existingStory.hero_image || undefined,
        status: existingStory.status,
        is_featured: existingStory.is_featured,
        has_sensitive_content: existingStory.has_sensitive_content,
        sensitivity_level: existingStory.sensitivity_level || undefined,
      });
    }
  }, [existingStory, form]);

  useEffect(() => {
    setLocalBlocks(blocks);
  }, [blocks]);

  const handleTitleChange = (title: string) => {
    form.setValue("title", title);
    if (!isEditing || !existingStory?.slug) {
      form.setValue("slug", generateSlug(title));
    }
  };

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    try {
      const values = form.getValues();
      const storyData = {
        ...values,
        status: publish ? "published" : values.status,
        published_at: publish
          ? new Date().toISOString()
          : existingStory?.published_at,
      };

      let savedStoryId = storyId;

      if (isEditing && storyId) {
        await cms.updateStory.mutateAsync({ id: storyId, ...storyData });
      } else {
        const newStory = await cms.createStory.mutateAsync(storyData as any);
        savedStoryId = newStory.id;
      }

      // Save blocks
      if (savedStoryId) {
        for (const block of localBlocks) {
          if (block.id.startsWith("temp-")) {
            await cms.createStoryBlock.mutateAsync({
              story_id: savedStoryId,
              block_type: block.block_type as any,
              block_order: block.block_order,
              content: block.content,
            });
          } else {
            await cms.updateStoryBlock.mutateAsync({
              id: block.id,
              storyId: savedStoryId,
              content: block.content,
              block_order: block.block_order,
            });
          }
        }
      }

      toast({
        title: publish ? "Story published!" : "Story saved",
        description: publish
          ? "Your story is now live."
          : "Draft saved successfully.",
      });

      if (!isEditing) {
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error saving story",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleIndexForAI = async () => {
    if (!storyId) {
      toast({
        title: "Save first",
        description: "Please save the story before indexing for AI.",
        variant: "destructive",
      });
      return;
    }
    setIsIndexing(true);
    try {
      await cms.indexContent.mutateAsync({
        contentId: storyId,
        contentType: "story",
      });
      toast({
        title: "Indexed for AI",
        description:
          "Story has been indexed and is now searchable by Ask Rwanda.",
      });
    } catch (error: any) {
      toast({
        title: "Indexing failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsIndexing(false);
    }
  };

  const handleAddBlock = (blockType: string) => {
    const newBlock: StoryBlock = {
      id: `temp-${Date.now()}`,
      story_id: storyId || "",
      block_type: blockType,
      block_order: localBlocks.length + 1,
      content: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocalBlocks([...localBlocks, newBlock]);
  };

  const handleUpdateBlock = (blockId: string, content: Record<string, any>) => {
    setLocalBlocks(
      localBlocks.map((b) => (b.id === blockId ? { ...b, content } : b)),
    );
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (blockId.startsWith("temp-")) {
      setLocalBlocks(localBlocks.filter((b) => b.id !== blockId));
    } else if (storyId) {
      await cms.deleteStoryBlock.mutateAsync({ id: blockId, storyId });
      setLocalBlocks(localBlocks.filter((b) => b.id !== blockId));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localBlocks.findIndex((b) => b.id === active.id);
      const newIndex = localBlocks.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(localBlocks, oldIndex, newIndex).map(
        (block, index) => ({
          ...block,
          block_order: index + 1,
        }),
      );
      setLocalBlocks(reordered);
    }
  };

  const hasSensitiveContent = form.watch("has_sensitive_content");

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Story" : "Create New Story"}
          </h1>
          <p className="text-muted-foreground">
            Build your story with multiple content blocks
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <Button
              variant="outline"
              onClick={handleIndexForAI}
              disabled={isIndexing}
            >
              <Brain className="h-4 w-4 mr-2" />
              {isIndexing ? "Indexing..." : "Index for AI"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isSaving}>
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.watch("title")}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter story title"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  {...form.register("slug")}
                  placeholder="story-url-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                {...form.register("summary")}
                placeholder="Brief description of the story"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Hero Image</Label>
              <MediaUpload
                value={form.watch("hero_image")}
                onChange={(url) =>
                  form.setValue("hero_image", url || undefined)
                }
                mediaType="image"
                folder="stories"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.watch("is_featured")}
                  onCheckedChange={(checked) =>
                    form.setValue("is_featured", checked)
                  }
                />
                <Label>Featured Story</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sensitive Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Sensitive Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={hasSensitiveContent}
                onCheckedChange={(checked) =>
                  form.setValue("has_sensitive_content", checked)
                }
              />
              <Label>Contains sensitive material</Label>
            </div>

            {hasSensitiveContent && (
              <div className="space-y-2">
                <Label>Sensitivity Level</Label>
                <Select
                  value={form.watch("sensitivity_level") || ""}
                  onValueChange={(value) =>
                    form.setValue("sensitivity_level", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Mild content</SelectItem>
                    <SelectItem value="medium">
                      Medium - Emotional content
                    </SelectItem>
                    <SelectItem value="high">
                      High - Graphic descriptions
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        {storyId && (
          <Card>
            <CardHeader>
              <CardTitle>Tags & Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <UniversalTagPicker
                contentId={storyId}
                contentType="story"
                allowedTagTypes={[
                  "theme",
                  "location",
                  "person",
                  "event",
                  "testimony",
                  "documentary",
                ]}
              />
            </CardContent>
          </Card>
        )}

        {/* Content Blocks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Content Blocks</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Block
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {blockTypes.map((bt) => {
                  const Icon = bt.icon;
                  return (
                    <DropdownMenuItem
                      key={bt.type}
                      onClick={() => handleAddBlock(bt.type)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {bt.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            {localBlocks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No content blocks yet.</p>
                <p className="text-sm">
                  Click "Add Block" to start building your story.
                </p>
              </div>
            ) : (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localBlocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {localBlocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        onUpdate={(content) =>
                          handleUpdateBlock(block.id, content)
                        }
                        onDelete={() => handleDeleteBlock(block.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
