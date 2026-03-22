import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { VRHotspot, VRScene } from "@/hooks/useVRScenes";
import { PanoramaPositionPicker } from "./PanoramaPositionPicker";

const hotspotSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["info", "audio", "video", "next-scene", "landmark"]),
  position_x: z.coerce.number().min(0).max(100),
  position_y: z.coerce.number().min(0).max(100),
  target_scene_id: z.string().optional(),
  audio_url: z.string().url().optional().or(z.literal("")),
  video_url: z.string().url().optional().or(z.literal("")),
  duration: z.coerce.number().optional(),
});

type HotspotFormValues = z.infer<typeof hotspotSchema>;

interface VRHotspotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotspot?: VRHotspot | null;
  sceneId: string;
  panoramaUrl: string;
  availableScenes: VRScene[];
  onSubmit: (values: HotspotFormValues) => void;
  isLoading?: boolean;
}

export function VRHotspotForm({
  open,
  onOpenChange,
  hotspot,
  sceneId,
  panoramaUrl,
  availableScenes,
  onSubmit,
  isLoading,
}: VRHotspotFormProps) {
  const isEditing = !!hotspot;
  const content = hotspot?.content as Record<string, unknown> | null;

  const form = useForm<HotspotFormValues>({
    resolver: zodResolver(hotspotSchema),
    defaultValues: {
      title: hotspot?.title ?? "",
      description: hotspot?.description ?? "",
      type: hotspot?.type ?? "info",
      position_x: hotspot?.position_x ?? 50,
      position_y: hotspot?.position_y ?? 50,
      target_scene_id: hotspot?.target_scene_id ?? "",
      audio_url: (content?.audioUrl as string) ?? "",
      video_url: (content?.videoUrl as string) ?? "",
      duration: (content?.duration as number) ?? undefined,
    },
  });

  // Reset form when hotspot changes
  useEffect(() => {
    if (open) {
      const contentData = hotspot?.content as Record<string, unknown> | null;
      form.reset({
        title: hotspot?.title ?? "",
        description: hotspot?.description ?? "",
        type: hotspot?.type ?? "info",
        position_x: hotspot?.position_x ?? 50,
        position_y: hotspot?.position_y ?? 50,
        target_scene_id: hotspot?.target_scene_id ?? "",
        audio_url: (contentData?.audioUrl as string) ?? "",
        video_url: (contentData?.videoUrl as string) ?? "",
        duration: (contentData?.duration as number) ?? undefined,
      });
    }
  }, [open, hotspot, form]);

  const watchType = form.watch("type");
  const watchPositionX = form.watch("position_x");
  const watchPositionY = form.watch("position_y");

  const handlePositionChange = (x: number, y: number) => {
    form.setValue("position_x", x);
    form.setValue("position_y", y);
  };

  const handleSubmit = (values: HotspotFormValues) => {
    onSubmit(values);
  };

  const otherScenes = availableScenes.filter((s) => s.id !== sceneId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Hotspot" : "Add New Hotspot"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the hotspot details below."
              : "Click on the panorama to position the hotspot, then fill in the details."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            {/* Visual Position Picker */}
            <PanoramaPositionPicker
              panoramaUrl={panoramaUrl}
              positionX={watchPositionX}
              positionY={watchPositionY}
              onPositionChange={handlePositionChange}
              hotspotType={watchType}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Wall of Names" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotspot Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="next-scene">Navigation</SelectItem>
                      <SelectItem value="landmark">Landmark</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A description of this hotspot..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position_x"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position X (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                    <FormDescription>0-100</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position_y"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Y (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                    <FormDescription>0-100</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchType === "next-scene" && (
              <FormField
                control={form.control}
                name="target_scene_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Scene</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scene to navigate to" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border z-50">
                        {otherScenes.map((scene) => (
                          <SelectItem key={scene.id} value={scene.id}>
                            {scene.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchType === "audio" && (
              <>
                <FormField
                  control={form.control}
                  name="audio_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audio URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/audio.mp3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {watchType === "video" && (
              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/video.mp4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Add Hotspot"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
