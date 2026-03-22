import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { RouteDifficulty } from "@/types/routes";

interface RouteFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RouteFormData) => Promise<void>;
  initialData?: Partial<RouteFormData>;
}

export interface RouteFormData {
  title: string;
  description: string;
  difficulty: RouteDifficulty;
  travel_mode: "walking" | "driving" | "cycling";
  estimated_duration_minutes: number;
  distance_km: number;
  cover_image?: string;
}

const difficulties: RouteDifficulty[] = ["easy", "moderate", "challenging", "expert"];
const travelModes = [
  { value: "walking", label: "Walking" },
  { value: "driving", label: "Driving" },
  { value: "cycling", label: "Cycling" },
];

export function RouteForm({ open, onClose, onSubmit, initialData }: RouteFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RouteFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    difficulty: initialData?.difficulty || "moderate",
    travel_mode: initialData?.travel_mode || "walking",
    estimated_duration_minutes: initialData?.estimated_duration_minutes || 60,
    distance_km: initialData?.distance_km || 0,
    cover_image: initialData?.cover_image || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      console.error("Error creating route:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Edit Route" : "New Route"}</DialogTitle>
            <DialogDescription>
              {initialData ? "Update route details" : "Create a new cultural route"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Route of Memory..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the route..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => setForm({ ...form, difficulty: v as RouteDifficulty })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Travel Mode</Label>
                <Select
                  value={form.travel_mode}
                  onValueChange={(v) => setForm({ ...form, travel_mode: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {travelModes.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={form.estimated_duration_minutes}
                  onChange={(e) =>
                    setForm({ ...form, estimated_duration_minutes: Number(e.target.value) })
                  }
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  value={form.distance_km}
                  onChange={(e) =>
                    setForm({ ...form, distance_km: Number(e.target.value) })
                  }
                  min={0}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.title.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
