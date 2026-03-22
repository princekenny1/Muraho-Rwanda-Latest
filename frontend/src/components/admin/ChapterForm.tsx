import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
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
import type { Chapter } from "@/hooks/useDocumentaries";

const chapterSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  duration: z.coerce.number().min(1, "Duration is required").max(60),
  type: z.enum(["narrative", "interview", "archival", "map"]),
});

type ChapterFormValues = z.infer<typeof chapterSchema>;

interface ChapterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter?: Chapter | null;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
}

export function ChapterForm({
  open,
  onOpenChange,
  chapter,
  onSubmit,
  isLoading,
}: ChapterFormProps) {
  const isEditing = !!chapter;

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      duration: 5,
      type: "narrative",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: chapter?.title ?? "",
        duration: chapter?.duration ?? 5,
        type: (chapter?.type as any) ?? "narrative",
      });
    }
  }, [open, chapter, form]);

  const handleSubmit = (values: ChapterFormValues) => {
    onSubmit(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit Chapter" : "Add New Chapter"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the chapter details."
              : "Fill in the details for the new chapter."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 mt-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="narrative">Narrative</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="archival">Archival</SelectItem>
                        <SelectItem value="map">Map</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                  : "Add Chapter"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
