import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PanoramaUploader } from "./PanoramaUploader";
import type { VRScene } from "@/hooks/useVRScenes";

const sceneSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  panorama_url: z.string().url("Must be a valid URL"),
  narration_text: z.string().max(2000).optional(),
  narration_audio_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type SceneFormValues = z.infer<typeof sceneSchema>;

interface VRSceneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scene?: VRScene | null;
  onSubmit: (values: SceneFormValues) => void;
  isLoading?: boolean;
}

export function VRSceneForm({
  open,
  onOpenChange,
  scene,
  onSubmit,
  isLoading,
}: VRSceneFormProps) {
  const isEditing = !!scene;

  const form = useForm<SceneFormValues>({
    resolver: zodResolver(sceneSchema),
    defaultValues: {
      title: scene?.title ?? "",
      description: scene?.description ?? "",
      panorama_url: scene?.panorama_url ?? "",
      narration_text: scene?.narration_text ?? "",
      narration_audio_url: scene?.narration_audio_url ?? "",
    },
  });

  // Reset form when scene changes or sheet opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        title: scene?.title ?? "",
        description: scene?.description ?? "",
        panorama_url: scene?.panorama_url ?? "",
        narration_text: scene?.narration_text ?? "",
        narration_audio_url: scene?.narration_audio_url ?? "",
      });
    }
  }, [open, scene, form]);

  const handleSubmit = (values: SceneFormValues) => {
    onSubmit({
      ...values,
      narration_audio_url: values.narration_audio_url || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Scene" : "Add New Scene"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the scene details below."
              : "Fill in the details for the new VR scene."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Memorial Entrance" {...field} />
                  </FormControl>
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
                      placeholder="A brief description of this scene..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="panorama_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Panorama Image</FormLabel>
                  <FormControl>
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="url">URL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-3">
                        <PanoramaUploader
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </TabsContent>
                      <TabsContent value="url" className="mt-3">
                        <Input
                          placeholder="https://example.com/panorama.jpg"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Enter a direct URL to a 360° equirectangular image
                        </p>
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="narration_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Narration Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="The narration script for this scene..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Text displayed as captions during guided mode
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="narration_audio_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Narration Audio URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/narration.mp3"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL to the audio file for guided narration
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Add Scene"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
