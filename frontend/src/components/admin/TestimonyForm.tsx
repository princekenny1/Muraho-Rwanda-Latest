import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import type { Testimony } from "@/hooks/useTestimonies";

const testimonySchema = z.object({
  person_name: z.string().min(1, "Name is required").max(100),
  title: z.string().min(1, "Title is required").max(200),
  context: z.string().min(1, "Context is required").max(2000),
  cover_image: z.string().url("Must be a valid URL"),
  category: z.enum(["survivor", "rescuer", "witness", "reconciliation"]),
  location: z.string().max(100).optional(),
  year: z.coerce.number().min(1900).max(2100).optional().or(z.literal("")),
  duration_minutes: z.coerce.number().min(1).max(300).optional().or(z.literal("")),
  has_content_warning: z.boolean(),
  is_featured: z.boolean(),
  video_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  captions_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type TestimonyFormValues = z.infer<typeof testimonySchema>;

interface TestimonyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimony?: Testimony | null;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
}

export function TestimonyForm({
  open,
  onOpenChange,
  testimony,
  onSubmit,
  isLoading,
}: TestimonyFormProps) {
  const isEditing = !!testimony;

  const form = useForm<TestimonyFormValues>({
    resolver: zodResolver(testimonySchema),
    defaultValues: {
      person_name: "",
      title: "",
      context: "",
      cover_image: "",
      category: "survivor",
      location: "",
      year: "",
      duration_minutes: "",
      has_content_warning: true,
      is_featured: false,
      video_url: "",
      captions_url: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        person_name: testimony?.person_name ?? "",
        title: testimony?.title ?? "",
        context: testimony?.context ?? "",
        cover_image: testimony?.cover_image ?? "",
        category: (testimony?.category as any) ?? "survivor",
        location: testimony?.location ?? "",
        year: testimony?.year ?? "",
        duration_minutes: testimony?.duration_minutes ?? "",
        has_content_warning: testimony?.has_content_warning ?? true,
        is_featured: testimony?.is_featured ?? false,
        video_url: testimony?.video_url ?? "",
        captions_url: testimony?.captions_url ?? "",
      });
    }
  }, [open, testimony, form]);

  const handleSubmit = (values: TestimonyFormValues) => {
    onSubmit({
      person_name: values.person_name,
      title: values.title,
      context: values.context,
      cover_image: values.cover_image,
      category: values.category,
      location: values.location || null,
      year: values.year || null,
      duration_minutes: values.duration_minutes || null,
      has_content_warning: values.has_content_warning,
      is_featured: values.is_featured,
      video_url: values.video_url || null,
      captions_url: values.captions_url || null,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit Testimony" : "Add New Testimony"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the testimony details below."
              : "Fill in the details for the new testimony."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 mt-6"
          >
            <FormField
              control={form.control}
              name="person_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Person Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Marie Uwimana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testimony Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Remembering My Family" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="survivor">Survivor</SelectItem>
                        <SelectItem value="rescuer">Rescuer</SelectItem>
                        <SelectItem value="witness">Witness</SelectItem>
                        <SelectItem value="reconciliation">
                          Reconciliation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Kigali" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2020"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cover_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Background information about the testimony..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief context shown before viewing the testimony
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL (Optional)</FormLabel>
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

            <FormField
              control={form.control}
              name="captions_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Captions URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/captions.vtt"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-2">
              <FormField
                control={form.control}
                name="has_content_warning"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Content Warning</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Featured</FormLabel>
                  </FormItem>
                )}
              />
            </div>

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
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : "Add Testimony"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
