import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { ExhibitionPanel } from "@/hooks/useExhibitions";

const panelSchema = z.object({
  title: z.string().min(1, "Title is required"),
  panel_number: z.coerce.number().min(1, "Panel number must be at least 1"),
  section_label: z.string().optional(),
  duration_minutes: z.coerce.number().min(1).default(5),
});

type PanelFormValues = z.infer<typeof panelSchema>;

interface PanelFormProps {
  panel?: ExhibitionPanel | null;
  defaultPanelNumber?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PanelFormValues) => void;
  isLoading?: boolean;
}

export function PanelForm({
  panel,
  defaultPanelNumber = 1,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: PanelFormProps) {
  const form = useForm<PanelFormValues>({
    resolver: zodResolver(panelSchema),
    defaultValues: {
      title: panel?.title || "",
      panel_number: panel?.panel_number || defaultPanelNumber,
      section_label: panel?.section_label || "",
      duration_minutes: panel?.duration_minutes || 5,
    },
  });

  const handleSubmit = (data: PanelFormValues) => {
    onSubmit({
      ...data,
      section_label: data.section_label || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{panel ? "Edit Panel" : "Create Panel"}</SheetTitle>
          <SheetDescription>
            {panel
              ? "Update the panel details"
              : "Add a new panel to this exhibition"}
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
                    <Input placeholder="Panel title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="panel_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Panel Number</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="section_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Label (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Introduction, Gallery A" {...field} />
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
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
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
                {isLoading ? "Saving..." : panel ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
