import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaUpload } from "./MediaUpload";
import { X, Save, Loader2, MapPin } from "lucide-react";
import type { RouteStop } from "@/types/routes";

interface StopEditorProps {
  stop: RouteStop;
  onUpdate: (stopId: string, data: Partial<RouteStop>) => void;
  onClose: () => void;
}

const markerColors = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#ef4444", label: "Red" },
  { value: "#22c55e", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
];

export function StopEditor({ stop, onUpdate, onClose }: StopEditorProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: stop.title || "",
    description: stop.description || "",
    cover_image: stop.cover_image || "",
    marker_color: stop.marker_color || "#3b82f6",
    duration_minutes: stop.duration_minutes || 15,
    audio_url: stop.audio_url || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      onUpdate(stop.id, form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background border rounded-lg shadow-lg w-80 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Edit Stop</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form */}
      <div className="p-3 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stop-title">Title</Label>
          <Input
            id="stop-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Stop name..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stop-desc">Description</Label>
          <Textarea
            id="stop-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What happens at this stop..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Cover Image</Label>
          <MediaUpload
            value={form.cover_image}
            onChange={(url) => setForm({ ...form, cover_image: url || "" })}
            mediaType="image"
            folder="routes"
          />
        </div>

        <div className="space-y-2">
          <Label>Audio Guide</Label>
          <MediaUpload
            value={form.audio_url}
            onChange={(url) => setForm({ ...form, audio_url: url || "" })}
            mediaType="audio"
            folder="routes"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Duration (min)</Label>
            <Input
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Marker Color</Label>
            <Select
              value={form.marker_color}
              onValueChange={(v) => setForm({ ...form, marker_color: v })}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: form.marker_color }}
                    />
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {markerColors.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: c.value }}
                      />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Coordinates (read-only) */}
        {stop.latitude && stop.longitude && (
          <div className="text-xs text-muted-foreground bg-muted rounded p-2">
            📍 {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t sticky bottom-0 bg-background">
        <Button onClick={handleSave} disabled={saving} className="w-full" size="sm">
          {saving ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
