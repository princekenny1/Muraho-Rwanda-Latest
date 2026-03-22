import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Plus, Pencil, Trash2, Search, Landmark, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { LocationPickerMap } from "@/components/cms/LocationPickerMap";
import { MediaUpload } from "@/components/admin/routes/MediaUpload";

// Since we don't have a dedicated landmarks table, we'll use locations with a specific type
// For public map markers, we filter locations that are "landmark" type

const landmarkCategories = [
  { value: "memorial", label: "Memorial" },
  { value: "historical", label: "Historical Site" },
  { value: "cultural", label: "Cultural Site" },
  { value: "natural", label: "Natural Landmark" },
  { value: "viewpoint", label: "Viewpoint" },
  { value: "other", label: "Other" },
];

interface Landmark {
  id: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  location_type: string | null;
  cover_image: string | null;
  is_active: boolean | null;
  slug: string;
}

export function LandmarksManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingLandmark, setEditingLandmark] = useState<Landmark | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    location_type: "landmark",
    cover_image: "",
    is_active: true,
  });

  // Fetch landmarks (locations that are viewable on map as public markers)
  const { data: landmarks = [], isLoading } = useQuery({
    queryKey: ["landmarks"],
    queryFn: async () => {
      const res = await api.find("locations", { sort: "name", limit: 500 });
      return res.docs as Landmark[];
    },
  });

  // Create landmark
  const createLandmark = useMutation({
    mutationFn: async (data: Omit<Landmark, "id">) => {
      await api.create("locations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landmarks"] });
      toast({ title: "Landmark created" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update landmark
  const updateLandmark = useMutation({
    mutationFn: async (data: Partial<Landmark> & { id: string }) => {
      const { id, ...updateData } = data;
      await api.update("locations", id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landmarks"] });
      toast({ title: "Landmark updated" });
      setEditingLandmark(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete landmark
  const deleteLandmark = useMutation({
    mutationFn: async (id: string) => {
      await api.delete("locations", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landmarks"] });
      toast({ title: "Landmark deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      latitude: "",
      longitude: "",
      location_type: "landmark",
      cover_image: "",
      is_active: true,
    });
    setIsCreating(false);
  };

  const handleEdit = (landmark: Landmark) => {
    setFormData({
      name: landmark.name,
      description: landmark.description || "",
      latitude: landmark.latitude?.toString() || "",
      longitude: landmark.longitude?.toString() || "",
      location_type: landmark.location_type || "landmark",
      cover_image: landmark.cover_image || "",
      is_active: landmark.is_active ?? true,
    });
    setEditingLandmark(landmark);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const payload = {
      name: formData.name,
      description: formData.description || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      location_type: formData.location_type,
      cover_image: formData.cover_image || null,
      is_active: formData.is_active,
      slug,
    };

    if (editingLandmark) {
      await updateLandmark.mutateAsync({ id: editingLandmark.id, ...payload });
    } else {
      await createLandmark.mutateAsync(payload);
    }
  };

  const filteredLandmarks = landmarks.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Public Landmarks</h2>
          <p className="text-sm text-muted-foreground">
            Map markers visible to all users
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Landmark
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search landmarks..."
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredLandmarks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No landmarks found.</p>
            <Button variant="link" onClick={() => setIsCreating(true)}>
              Add your first landmark
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredLandmarks.map((landmark) => (
            <Card key={landmark.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Landmark className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{landmark.name}</h3>
                      {!landmark.is_active && (
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {landmark.location_type && (
                        <Badge variant="secondary" className="capitalize text-xs">
                          {landmark.location_type.replace("_", " ")}
                        </Badge>
                      )}
                      {landmark.latitude && landmark.longitude && (
                        <span>
                          {landmark.latitude.toFixed(4)}, {landmark.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(landmark)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteId(landmark.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editingLandmark} onOpenChange={(open) => {
        if (!open) {
          resetForm();
          setEditingLandmark(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLandmark ? "Edit Landmark" : "Add Landmark"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Volcano Viewpoint"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) => setFormData({ ...formData, location_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {landmarkCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <LocationPickerMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng) =>
                  setFormData({
                    ...formData,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <MediaUpload
                value={formData.cover_image}
                onChange={(url) => setFormData({ ...formData, cover_image: url || "" })}
                mediaType="image"
                folder="landmarks"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Visible on Map</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setEditingLandmark(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingLandmark ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete landmark?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the landmark from the public map.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteLandmark.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
