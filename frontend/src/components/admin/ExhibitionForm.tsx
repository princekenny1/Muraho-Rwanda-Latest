import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Exhibition } from "@/hooks/useExhibitions";

const exhibitionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  is_permanent: z.boolean().default(true),
  image_url: z.string().url().optional().or(z.literal("")),
});

type ExhibitionFormValues = z.infer<typeof exhibitionSchema>;

interface ExhibitionFormProps {
  exhibition?: Exhibition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExhibitionFormValues) => void;
  isLoading?: boolean;
}

export function ExhibitionForm({
  exhibition,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: ExhibitionFormProps) {
  const form = useForm<ExhibitionFormValues>({
    resolver: zodResolver(exhibitionSchema),
    defaultValues: {
      title: exhibition?.title || "",
      description: exhibition?.description || "",
      is_permanent: exhibition?.is_permanent ?? true,
      image_url: exhibition?.image_url || "",
    },
  });

  const handleSubmit = (data: ExhibitionFormValues) => {
    onSubmit({
      ...data,
      image_url: data.image_url || undefined,
      description: data.description || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {exhibition ? "Edit Exhibition" : "Create Exhibition"}
          </SheetTitle>
          <SheetDescription>
            {exhibition
              ? "Update the exhibition details"
              : "Add a new exhibition to the museum"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Exhibition title" {...field} />
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
                      placeholder="Brief description of the exhibition"
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
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_permanent"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Permanent Exhibition</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Mark as a permanent exhibition
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : exhibition ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
