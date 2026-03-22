import { useState } from "react";
import { Plus, MapPin, GripVertical, Trash2, Pencil, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useMuseumOutdoorStops,
  useOutdoorStopMutations,
  MuseumOutdoorStop,
  Museum,
} from "@/hooks/useMuseumAdmin";
import { OutdoorStopMap } from "./OutdoorStopMap";
import { toast } from "sonner";

interface MuseumOutdoorTabProps {
  museumId: string;
  museum: Museum;
}

export function MuseumOutdoorTab({ museumId, museum }: MuseumOutdoorTabProps) {
  const { data: stops = [], isLoading } = useMuseumOutdoorStops(museumId);
  const { createStop, updateStop, deleteStop } = useOutdoorStopMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [editingStop, setEditingStop] = useState<MuseumOutdoorStop | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    latitude: museum.latitude || -1.9403,
    longitude: museum.longitude || 29.8739,
    estimated_time_minutes: 10,
    autoplay_on_arrival: false,
    marker_color: "#4B5573",
  });

  const handleOpenCreate = (lat?: number, lng?: number) => {
    setEditingStop(null);
    setFormData({
      title: "",
      description: "",
      latitude: lat ?? museum.latitude ?? -1.9403,
      longitude: lng ?? museum.longitude ?? 29.8739,
      estimated_time_minutes: 10,
      autoplay_on_arrival: false,
      marker_color: "#4B5573",
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (stop: MuseumOutdoorStop) => {
    setEditingStop(stop);
    setSelectedStopId(stop.id);
    setFormData({
      title: stop.title,
      description: stop.description || "",
      latitude: stop.latitude,
      longitude: stop.longitude,
      estimated_time_minutes: stop.estimated_time_minutes || 10,
      autoplay_on_arrival: stop.autoplay_on_arrival || false,
      marker_color: stop.marker_color || "#4B5573",
    });
    setIsEditing(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    handleOpenCreate(lat, lng);
    toast.info("Pin placed! Fill in the stop details.");
  };

  const handleStopDrag = async (stopId: string, lat: number, lng: number) => {
    await updateStop.mutateAsync({
      id: stopId,
      latitude: lat,
      longitude: lng,
    });
    toast.success("Stop location updated");
  };

  const handleStopSelect = (stop: MuseumOutdoorStop) => {
    setSelectedStopId(stop.id);
  };

  const handleSave = async () => {
    if (editingStop) {
      await updateStop.mutateAsync({
        id: editingStop.id,
        ...formData,
      });
      toast.success("Stop updated");
    } else {
      const newOrder = stops.length + 1;
      await createStop.mutateAsync({
        museum_id: museumId,
        stop_order: newOrder,
        ...formData,
      });
      toast.success("Stop created");
    }
    setIsEditing(false);
  };

  const handleDelete = async (stop: MuseumOutdoorStop) => {
    await deleteStop.mutateAsync({ id: stop.id, museumId });
    toast.success("Stop deleted");
    if (selectedStopId === stop.id) {
      setSelectedStopId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Outdoor Map
          </CardTitle>
          <CardDescription>
            Click on the map to add a new stop, or drag existing pins to reposition them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OutdoorStopMap
            museum={museum}
            stops={stops}
            selectedStopId={selectedStopId}
            onStopSelect={handleStopSelect}
            onMapClick={handleMapClick}
            onStopDrag={handleStopDrag}
          />
        </CardContent>
      </Card>

      {/* Stops List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Outdoor Stops</CardTitle>
            <CardDescription>
              Gardens, memorials, and outdoor points of interest
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenCreate()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stop
          </Button>
        </CardHeader>
        <CardContent>
          {stops.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium">No outdoor stops yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Click on the map above or use the button to add stops
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStopId === stop.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-5 w-5 cursor-grab" />
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: stop.marker_color || "#4B5573" }}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{stop.title}</p>
                    {stop.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {stop.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {stop.autoplay_on_arrival && (
                      <Badge variant="secondary" className="text-xs">
                        Autoplay
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {stop.estimated_time_minutes}min
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(stop);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Stop</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{stop.title}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(stop)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingStop ? "Edit Stop" : "Add Outdoor Stop"}</SheetTitle>
            <SheetDescription>
              {editingStop
                ? "Update the outdoor stop details"
                : "Create a new outdoor memorial stop"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Stop Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Memorial Garden"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this stop..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Estimated Time (min)</Label>
                <Input
                  id="time"
                  type="number"
                  value={formData.estimated_time_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_time_minutes: parseInt(e.target.value) || 10,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Marker Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.marker_color}
                    onChange={(e) =>
                      setFormData({ ...formData, marker_color: e.target.value })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.marker_color}
                    onChange={(e) =>
                      setFormData({ ...formData, marker_color: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="autoplay">Autoplay on Arrival</Label>
                <p className="text-sm text-muted-foreground">
                  Start content automatically when visitor arrives
                </p>
              </div>
              <Switch
                id="autoplay"
                checked={formData.autoplay_on_arrival}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, autoplay_on_arrival: checked })
                }
              />
            </div>
            <div className="pt-4">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={!formData.title.trim() || createStop.isPending || updateStop.isPending}
              >
                {createStop.isPending || updateStop.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingStop ? (
                  "Update Stop"
                ) : (
                  "Create Stop"
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}