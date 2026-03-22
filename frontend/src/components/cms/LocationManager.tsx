import { useState } from "react";
import { Plus, Pencil, Trash2, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useContentCMS, Location, generateSlug } from "@/hooks/useContentCMS";
import { MediaUpload } from "@/components/admin/routes/MediaUpload";
import { LocationPickerMap } from "./LocationPickerMap";

const locationTypes = [
  { value: "memorial", label: "Memorial" },
  { value: "museum", label: "Museum" },
  { value: "historical_site", label: "Historical Site" },
  { value: "city", label: "City" },
  { value: "region", label: "Region" },
  { value: "other", label: "Other" },
];

export function LocationManager() {
  const { toast } = useToast();
  const cms = useContentCMS();
  const { data: locations = [], isLoading } = cms.useLocations();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    location_type: "",
    cover_image: "",
  });

  const filteredLocations = locations.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      latitude: "",
      longitude: "",
      location_type: "",
      cover_image: "",
    });
    setEditingLocation(null);
    setIsCreating(false);
  };

  const handleEdit = (location: Location) => {
    setFormData({
      name: location.name,
      description: location.description || "",
      address: location.address || "",
      latitude: location.latitude?.toString() || "",
      longitude: location.longitude?.toString() || "",
      location_type: location.location_type || "",
      cover_image: location.cover_image || "",
    });
    setEditingLocation(location);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        location_type: formData.location_type || undefined,
        cover_image: formData.cover_image || undefined,
      };

      if (editingLocation) {
        await cms.updateLocation.mutateAsync({ id: editingLocation.id, ...payload });
        toast({ title: "Location updated" });
      } else {
        await cms.createLocation.mutateAsync({
          ...payload,
          slug: generateSlug(formData.name),
          is_active: true,
        });
        toast({ title: "Location created" });
      }
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await cms.deleteLocation.mutateAsync(deleteId);
      toast({ title: "Location deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Locations</h1>
          <p className="text-muted-foreground">
            Memorials, museums, cities, and historical sites
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations..."
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredLocations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No locations found.</p>
            <Button variant="link" onClick={() => setIsCreating(true)}>
              Add your first location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{location.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {location.location_type && (
                        <Badge variant="secondary" className="capitalize text-xs">
                          {location.location_type.replace("_", " ")}
                        </Badge>
                      )}
                      {location.latitude && location.longitude && (
                        <span>
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(location)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteId(location.id)}
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
      <Dialog open={isCreating || !!editingLocation} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLocation ? "Edit Location" : "Add Location"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Kigali Genocide Memorial"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) => setFormData({ ...formData, location_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
              />
            </div>
            {/* Map-based location picker */}
            <div className="space-y-2">
              <Label>Coordinates</Label>
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
            
            {/* Manual coordinate input (fallback) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="-1.9403"
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="29.8739"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <MediaUpload
                value={formData.cover_image}
                onChange={(url) => setFormData({ ...formData, cover_image: url || "" })}
                mediaType="image"
                folder="locations"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="About this location..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingLocation ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the location from the system. Content tagged with this
              location will lose this tag.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
