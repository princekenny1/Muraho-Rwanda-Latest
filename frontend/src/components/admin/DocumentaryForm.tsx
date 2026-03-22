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
import type { Documentary } from "@/hooks/useDocumentaries";

const documentarySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  synopsis: z.string().min(1, "Synopsis is required").max(2000),
  cover_image: z.string().url("Must be a valid URL"),
  runtime: z.coerce.number().min(1, "Runtime is required").max(600),
  year: z.coerce.number().min(1900).max(2100),
  director: z.string().max(100).optional(),
  type: z.enum(["historical", "survivor", "cultural", "educational"]),
  is_new: z.boolean(),
  is_featured: z.boolean(),
});

type DocumentaryFormValues = z.infer<typeof documentarySchema>;

interface DocumentaryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentary?: Documentary | null;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
}

export function DocumentaryForm({
  open,
  onOpenChange,
  documentary,
  onSubmit,
  isLoading,
}: DocumentaryFormProps) {
  const isEditing = !!documentary;

  const form = useForm<DocumentaryFormValues>({
    resolver: zodResolver(documentarySchema),
    defaultValues: {
      title: "",
      synopsis: "",
      cover_image: "",
      runtime: 60,
      year: new Date().getFullYear(),
      director: "",
      type: "historical",
      is_new: false,
      is_featured: false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: documentary?.title ?? "",
        synopsis: documentary?.synopsis ?? "",
        cover_image: documentary?.cover_image ?? "",
        runtime: documentary?.runtime ?? 60,
        year: documentary?.year ?? new Date().getFullYear(),
        director: documentary?.director ?? "",
        type: (documentary?.type as any) ?? "historical",
        is_new: documentary?.is_new ?? false,
        is_featured: documentary?.is_featured ?? false,
      });
    }
  }, [open, documentary, form]);

  const handleSubmit = (values: DocumentaryFormValues) => {
    onSubmit({
      ...values,
      director: values.director || null,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit Documentary" : "Add New Documentary"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the documentary details below."
              : "Fill in the details for the new documentary."}
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Rwanda: The Untold Story" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
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
                        <SelectItem value="historical">Historical</SelectItem>
                        <SelectItem value="survivor">Survivor</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="runtime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Runtime (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="90" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="director"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Director</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
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
                      placeholder="https://example.com/cover.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="synopsis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Synopsis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A documentary exploring..."
                      className="resize-none"
                      rows={4}
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
                name="is_new"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Mark as New</FormLabel>
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
                  : "Add Documentary"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
