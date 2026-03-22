import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save, Quote as QuoteIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useContentCMS, Quote } from "@/hooks/useContentCMS";
import { useTestimonies } from "@/hooks/useTestimonies";

interface QuoteEditorProps {
  quoteId?: string | null;
  onClose: () => void;
}

export function QuoteEditor({ quoteId, onClose }: QuoteEditorProps) {
  const { toast } = useToast();
  const cms = useContentCMS();
  const { data: testimonies = [] } = useTestimonies();
  const { data: people = [] } = cms.usePeople();
  const { data: quotes = [] } = cms.useQuotes();

  const isEditing = !!quoteId;
  const existingQuote = quotes?.find((q) => q.id === quoteId);

  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<Partial<Quote>>({
    defaultValues: {
      text: "",
      attribution: "",
      source_url: "",
      person_id: undefined,
      testimony_id: undefined,
      is_featured: false,
    },
  });

  useEffect(() => {
    if (existingQuote) {
      form.reset({
        text: existingQuote.text,
        attribution: existingQuote.attribution || "",
        source_url: existingQuote.source_url || "",
        person_id: existingQuote.person_id || undefined,
        testimony_id: existingQuote.testimony_id || undefined,
        is_featured: existingQuote.is_featured,
      });
    }
  }, [existingQuote, form]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const values = form.getValues();

      if (!values.text?.trim()) {
        toast({
          title: "Quote text required",
          description: "Please enter the quote text.",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && quoteId) {
        await cms.updateQuote.mutateAsync({
          id: quoteId,
          ...values,
        });
      } else {
        await cms.createQuote.mutateAsync(values as any);
      }

      toast({
        title: "Quote saved",
        description: "The quote has been saved successfully.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error saving quote",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Quote" : "Add New Quote"}
          </h1>
          <p className="text-muted-foreground">
            Standalone quotes for emphasis in content
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Save Quote
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QuoteIcon className="h-5 w-5" />
              Quote Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Quote Text *</Label>
              <Textarea
                {...form.register("text")}
                placeholder="Enter the quote..."
                rows={4}
                className="text-lg italic"
              />
            </div>

            <div className="space-y-2">
              <Label>Attribution</Label>
              <Input
                {...form.register("attribution")}
                placeholder="Who said this? (e.g., 'Survivor, 1998')"
              />
            </div>

            <div className="space-y-2">
              <Label>Source URL (optional)</Label>
              <Input
                {...form.register("source_url")}
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch("is_featured")}
                onCheckedChange={(checked) =>
                  form.setValue("is_featured", checked)
                }
              />
              <Label>Featured Quote</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Link to Person or Testimony
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Link to Person</Label>
              <Select
                value={form.watch("person_id") || "none"}
                onValueChange={(value) =>
                  form.setValue(
                    "person_id",
                    value === "none" ? undefined : value,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a person (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No link</SelectItem>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Link to Testimony</Label>
              <Select
                value={form.watch("testimony_id") || "none"}
                onValueChange={(value) =>
                  form.setValue(
                    "testimony_id",
                    value === "none" ? undefined : value,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a testimony (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No link</SelectItem>
                  {testimonies.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.person_name} - {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground">
              Linking helps the AI provide context when this quote appears in
              search results or recommendations.
            </p>
          </CardContent>
        </Card>

        {/* Preview */}
        {form.watch("text") && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
                "{form.watch("text")}"
              </blockquote>
              {form.watch("attribution") && (
                <p className="mt-2 text-sm text-muted-foreground">
                  — {form.watch("attribution")}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
