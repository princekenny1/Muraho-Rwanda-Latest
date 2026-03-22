import { useState } from "react";
import { X, Clock, MapPin, Palette, Volume2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ContentBlockManager } from "./ContentBlockManager";
import type { RouteStop, StopMarkerIcon } from "@/types/routes";

interface StopEditorProps {
  stop: RouteStop;
  onUpdate: (id: string, data: Partial<RouteStop>) => Promise<boolean>;
  onClose: () => void;
}

const markerColors = [
  { value: "#F97316", label: "Orange" },
  { value: "#EAB308", label: "Yellow" },
  { value: "#22C55E", label: "Green" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#EF4444", label: "Red" },
  { value: "#6B7280", label: "Gray" },
];

const markerIcons: { value: StopMarkerIcon; label: string }[] = [
  { value: "location", label: "Location" },
  { value: "museum", label: "Museum" },
  { value: "culture", label: "Culture" },
  { value: "history", label: "History" },
  { value: "nature", label: "Nature" },
  { value: "food", label: "Food" },
  { value: "accommodation", label: "Accommodation" },
];

export function StopEditor({ stop, onUpdate, onClose }: StopEditorProps) {
  const [title, setTitle] = useState(stop.title);
  const [description, setDescription] = useState(stop.description || "");
  const [estimatedTime, setEstimatedTime] = useState(stop.estimated_time_minutes);
  const [autoplayOnArrival, setAutoplayOnArrival] = useState(stop.autoplay_on_arrival);
  const [markerColor, setMarkerColor] = useState(stop.marker_color);
  const [markerIcon, setMarkerIcon] = useState<StopMarkerIcon>(stop.marker_icon);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(stop.id, {
      title,
      description: description || null,
      estimated_time_minutes: estimatedTime,
      autoplay_on_arrival: autoplayOnArrival,
      marker_color: markerColor,
      marker_icon: markerIcon,
    });
    setIsSaving(false);
  };

  return (
    <div className="w-96 border-l bg-background flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Edit Stop</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="stopTitle">Stop Name</Label>
              <Input
                id="stopTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stopDesc">Description</Label>
              <Textarea
                id="stopDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What visitors will experience here..."
              />
            </div>
          </div>

          <Separator />

          {/* Location Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="px-3 py-2 bg-muted rounded-md">
                <span className="text-muted-foreground">Lat: </span>
                <span className="font-mono">{Number(stop.latitude).toFixed(5)}</span>
              </div>
              <div className="px-3 py-2 bg-muted rounded-md">
                <span className="text-muted-foreground">Lng: </span>
                <span className="font-mono">{Number(stop.longitude).toFixed(5)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Drag the marker on the map to reposition
            </p>
          </div>

          <Separator />

          {/* Time & Behavior */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time & Behavior</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
              <Input
                id="estimatedTime"
                type="number"
                min={1}
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoplay" className="text-sm">Autoplay on Arrival</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically start media when user arrives
                </p>
              </div>
              <Switch
                id="autoplay"
                checked={autoplayOnArrival}
                onCheckedChange={setAutoplayOnArrival}
              />
            </div>
          </div>

          <Separator />

          {/* Marker Style */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Palette className="h-4 w-4" />
              <span>Marker Style</span>
            </div>

            <div className="space-y-2">
              <Label>Marker Color</Label>
              <div className="flex flex-wrap gap-2">
                {markerColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setMarkerColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      markerColor === color.value
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="markerIcon">Marker Icon</Label>
              <Select value={markerIcon} onValueChange={(v) => setMarkerIcon(v as StopMarkerIcon)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {markerIcons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Content Blocks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Content Blocks</span>
            </div>
            <ContentBlockManager stopId={stop.id} />
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t">
        <Button 
          className="w-full" 
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
