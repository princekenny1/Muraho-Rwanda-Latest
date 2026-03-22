import { useState } from "react";
import {
  Check,
  ChevronsUpDown,
  Plus,
  X,
  Tag,
  MapPin,
  Users,
  Calendar,
  Building,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useContentCMS, generateSlug } from "@/hooks/useContentCMS";
import { useTestimonies } from "@/hooks/useTestimonies";
import { useDocumentaries } from "@/hooks/useDocumentaries";

type TagType =
  | "theme"
  | "location"
  | "person"
  | "event"
  | "museum"
  | "route"
  | "testimony"
  | "documentary";

interface UniversalTagPickerProps {
  contentId: string;
  contentType: string;
  allowedTagTypes?: TagType[];
  onChange?: () => void;
}

const tagTypeConfig: Record<
  TagType,
  { icon: any; label: string; color: string }
> = {
  theme: {
    icon: Tag,
    label: "Themes",
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  },
  location: {
    icon: MapPin,
    label: "Locations",
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
  },
  person: {
    icon: Users,
    label: "People",
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  event: {
    icon: Calendar,
    label: "Events",
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
  },
  museum: {
    icon: Building,
    label: "Museums",
    color: "bg-rose-500/10 text-rose-700 border-rose-200",
  },
  route: {
    icon: Map,
    label: "Routes",
    color: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  },
  testimony: {
    icon: Users,
    label: "Testimonies",
    color: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
  documentary: {
    icon: Users,
    label: "Documentaries",
    color: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  },
};

export function UniversalTagPicker({
  contentId,
  contentType,
  allowedTagTypes = ["theme", "location", "person", "event"],
  onChange,
}: UniversalTagPickerProps) {
  const cms = useContentCMS();
  const { data: contentTags = [], isLoading: tagsLoading } = cms.useContentTags(
    contentId,
    contentType,
  );
  const { data: themes = [] } = cms.useThemes();
  const { data: locations = [] } = cms.useLocations();
  const { data: people = [] } = cms.usePeople();
  const { data: events = [] } = cms.useHistoricalEvents();
  const { data: testimonies = [] } = useTestimonies();
  const { data: documentaries = [] } = useDocumentaries();

  const [openPicker, setOpenPicker] = useState<TagType | null>(null);
  const [createDialogType, setCreateDialogType] = useState<TagType | null>(
    null,
  );
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");

  const getTagsForType = (type: TagType) => {
    switch (type) {
      case "theme":
        return themes.map((t) => ({ id: t.id, name: t.name, type: "theme" }));
      case "location":
        return locations.map((l) => ({
          id: l.id,
          name: l.name,
          type: "location",
        }));
      case "person":
        return people.map((p) => ({ id: p.id, name: p.name, type: "person" }));
      case "event":
        return events.map((e) => ({ id: e.id, name: e.name, type: "event" }));
      case "testimony":
        return testimonies.map((t) => ({
          id: t.id,
          name: t.person_name,
          type: "testimony",
        }));
      case "documentary":
        return documentaries.map((d) => ({
          id: d.id,
          name: d.title,
          type: "documentary",
        }));
      default:
        return [];
    }
  };

  const getSelectedTagIds = (type: TagType) => {
    return contentTags.filter((t) => t.tag_type === type).map((t) => t.tag_id);
  };

  const handleAddTag = async (tagType: TagType, tagId: string) => {
    await cms.addContentTag.mutateAsync({
      content_id: contentId,
      content_type: contentType,
      tag_type: tagType,
      tag_id: tagId,
    });
    onChange?.();
  };

  const handleRemoveTag = async (tagId: string) => {
    const tag = contentTags.find((t) => t.tag_id === tagId);
    if (tag) {
      await cms.removeContentTag.mutateAsync({
        id: tag.id,
        contentId,
        contentType,
      });
      onChange?.();
    }
  };

  const handleCreateNew = async () => {
    if (!createDialogType || !newItemName.trim()) return;

    const slug = generateSlug(newItemName);

    try {
      let newItem;
      switch (createDialogType) {
        case "theme":
          newItem = await cms.createTheme.mutateAsync({
            name: newItemName,
            slug,
            description: newItemDescription,
            is_active: true,
            color: "#4B5573",
          });
          break;
        case "location":
          newItem = await cms.createLocation.mutateAsync({
            name: newItemName,
            slug,
            description: newItemDescription,
            is_active: true,
          });
          break;
        case "person":
          newItem = await cms.createPerson.mutateAsync({
            name: newItemName,
            slug,
            biography: newItemDescription,
            is_public: true,
          });
          break;
        case "event":
          newItem = await cms.createHistoricalEvent.mutateAsync({
            name: newItemName,
            slug,
            description: newItemDescription,
            is_sensitive: false,
          });
          break;
      }

      if (newItem) {
        await handleAddTag(createDialogType, newItem.id);
      }

      setCreateDialogType(null);
      setNewItemName("");
      setNewItemDescription("");
    } catch (error) {
      console.error("Failed to create new item:", error);
    }
  };

  const getTagName = (tagType: string, tagId: string) => {
    const tags = getTagsForType(tagType as TagType);
    return tags.find((t) => t.id === tagId)?.name || "Unknown";
  };

  if (tagsLoading) {
    return <div className="animate-pulse h-20 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Tags & Relationships</Label>

      {/* Tag Type Pickers */}
      <div className="flex flex-wrap gap-2">
        {allowedTagTypes.map((type) => {
          const config = tagTypeConfig[type];
          const Icon = config.icon;
          const availableTags = getTagsForType(type);
          const selectedIds = getSelectedTagIds(type);

          return (
            <Popover
              key={type}
              open={openPicker === type}
              onOpenChange={(open) => setOpenPicker(open ? type : null)}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Icon className="h-4 w-4" />
                  {config.label}
                  <Badge variant="secondary" className="ml-1">
                    {selectedIds.length}
                  </Badge>
                  <ChevronsUpDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder={`Search ${config.label.toLowerCase()}...`}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <p className="text-sm text-muted-foreground p-2">
                        No {config.label.toLowerCase()} found.
                      </p>
                      {["theme", "location", "person", "event"].includes(
                        type,
                      ) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => {
                            setOpenPicker(null);
                            setCreateDialogType(type);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Create new
                        </Button>
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {availableTags.map((tag) => {
                        const isSelected = selectedIds.includes(tag.id);
                        return (
                          <CommandItem
                            key={tag.id}
                            value={tag.name}
                            onSelect={() => {
                              if (isSelected) {
                                handleRemoveTag(tag.id);
                              } else {
                                handleAddTag(type, tag.id);
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {tag.name}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                    {["theme", "location", "person", "event"].includes(type) &&
                      availableTags.length > 0 && (
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setOpenPicker(null);
                              setCreateDialogType(type);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create new {type}
                          </CommandItem>
                        </CommandGroup>
                      )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>

      {/* Selected Tags Display */}
      {contentTags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {contentTags.map((tag) => {
            const config = tagTypeConfig[tag.tag_type as TagType];
            const Icon = config?.icon || Tag;
            return (
              <Badge
                key={tag.id}
                variant="outline"
                className={cn("gap-1.5 pr-1", config?.color)}
              >
                <Icon className="h-3 w-3" />
                {getTagName(tag.tag_type, tag.tag_id)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => handleRemoveTag(tag.tag_id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Create New Dialog */}
      <Dialog
        open={!!createDialogType}
        onOpenChange={(open) => !open && setCreateDialogType(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New {createDialogType}</DialogTitle>
            <DialogDescription>
              Add a new {createDialogType} to the system and tag this content
              with it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Enter ${createDialogType} name`}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder={`Enter description`}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNew} disabled={!newItemName.trim()}>
              Create & Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
