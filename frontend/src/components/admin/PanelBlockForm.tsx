import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PanelBlock } from "@/hooks/useExhibitions";

const blockSchema = z.object({
  block_type: z.enum(["text", "quote", "video", "audio", "context"]),
  block_order: z.coerce.number().min(1),
  // Text block
  text_content: z.string().optional(),
  // Quote block
  quote: z.string().optional(),
  attribution: z.string().optional(),
  year: z.string().optional(),
  // Media blocks
  media_url: z.string().url().optional().or(z.literal("")),
  media_title: z.string().optional(),
  media_description: z.string().optional(),
  // Context block
  context_title: z.string().optional(),
  context_description: z.string().optional(),
});

type BlockFormValues = z.infer<typeof blockSchema>;

interface PanelBlockFormProps {
  block?: PanelBlock | null;
  defaultBlockOrder?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { block_type: string; block_order: number; content: Record<string, unknown> }) => void;
  isLoading?: boolean;
}

export function PanelBlockForm({
  block,
  defaultBlockOrder = 1,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: PanelBlockFormProps) {
  const getDefaultValues = (): BlockFormValues => {
    if (!block) {
      return {
        block_type: "text",
        block_order: defaultBlockOrder,
        text_content: "",
        quote: "",
        attribution: "",
        year: "",
        media_url: "",
        media_title: "",
        media_description: "",
        context_title: "",
        context_description: "",
      };
    }

    const content = block.content as Record<string, string>;
    return {
      block_type: block.block_type as BlockFormValues["block_type"],
      block_order: block.block_order,
      text_content: content.content || "",
      quote: content.quote || "",
      attribution: content.attribution || "",
      year: content.year || "",
      media_url: content.url || "",
      media_title: content.title || "",
      media_description: content.description || "",
      context_title: content.title || "",
      context_description: content.description || "",
    };
  };

  const form = useForm<BlockFormValues>({
    resolver: zodResolver(blockSchema),
    defaultValues: getDefaultValues(),
  });

  const blockType = form.watch("block_type");

  const handleSubmit = (data: BlockFormValues) => {
    let content: Record<string, unknown> = {};

    switch (data.block_type) {
      case "text":
        content = { content: data.text_content };
        break;
      case "quote":
        content = {
          quote: data.quote,
          attribution: data.attribution,
          year: data.year || undefined,
        };
        break;
      case "video":
      case "audio":
        content = {
          url: data.media_url,
          title: data.media_title || undefined,
          description: data.media_description || undefined,
        };
        break;
      case "context":
        content = {
          title: data.context_title,
          description: data.context_description,
        };
        break;
    }

    onSubmit({
      block_type: data.block_type,
      block_order: data.block_order,
      content,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{block ? "Edit Block" : "Create Block"}</SheetTitle>
          <SheetDescription>
            {block ? "Update the content block" : "Add a new content block"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-6"
          >
            <FormField
              control={form.control}
              name="block_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Block Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select block type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="quote">Quote</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="context">Context</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="block_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {blockType === "text" && (
              <FormField
                control={form.control}
                name="text_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="Text content..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {blockType === "quote" && (
              <>
                <FormField
                  control={form.control}
                  name="quote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="The quote text..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attribution</FormLabel>
                      <FormControl>
                        <Input placeholder="Speaker name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="1994" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {(blockType === "video" || blockType === "audio") && (
              <>
                <FormField
                  control={form.control}
                  name="media_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{blockType === "video" ? "Video" : "Audio"} URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="media_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Media title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="media_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="Brief description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {blockType === "context" && (
              <>
                <FormField
                  control={form.control}
                  name="context_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Context title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="context_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Context description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

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
                {isLoading ? "Saving..." : block ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
