import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Plus, Pencil, Trash2, Search, Route, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type Relation = string | { id: string; name?: string; title?: string };

interface OutdoorStop {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  museum: Relation;
  markerColor?: string;
  markerIcon?: string;
}

interface RouteStop {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  route: Relation;
  markerColor?: string;
  markerIcon?: string;
}

interface StopForm {
  title: string;
  description: string;
  latitude: string;
  longitude: string;
  stopOrder: number;
  relationId: string;
  markerColor: string;
}

const emptyOutdoorForm: StopForm = {
  title: "",
  description: "",
  latitude: "",
  longitude: "",
  stopOrder: 1,
  relationId: "",
  markerColor: "#4B5573",
};

const emptyRouteForm: StopForm = {
  title: "",
  description: "",
  latitude: "",
  longitude: "",
  stopOrder: 1,
  relationId: "",
  markerColor: "#F97316",
};

const relationName = (value: Relation): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.title || value.id;
};

const relationId = (value: Relation): string => {
  if (!value) return "";
  return typeof value === "string" ? value : value.id;
};

export function StopsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("outdoor");

  const [creatingOutdoor, setCreatingOutdoor] = useState(false);
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [editingOutdoorStop, setEditingOutdoorStop] =
    useState<OutdoorStop | null>(null);
  const [editingRouteStop, setEditingRouteStop] = useState<RouteStop | null>(
    null,
  );
  const [deleteOutdoorId, setDeleteOutdoorId] = useState<string | null>(null);
  const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);

  const [outdoorForm, setOutdoorForm] = useState<StopForm>(emptyOutdoorForm);
  const [routeForm, setRouteForm] = useState<StopForm>(emptyRouteForm);

  const { data: outdoorStops = [], isLoading: loadingOutdoor } = useQuery({
    queryKey: ["outdoor-stops"],
    queryFn: async () => {
      const res = await api.find("museum-outdoor-stops", {
        sort: "stopOrder",
        limit: 500,
        depth: 1,
      });
      return res.docs as OutdoorStop[];
    },
  });

  const { data: routeStops = [], isLoading: loadingRoute } = useQuery({
    queryKey: ["route-stops"],
    queryFn: async () => {
      const res = await api.find("route-stops", {
        sort: "stopOrder",
        limit: 500,
        depth: 1,
      });
      return res.docs as RouteStop[];
    },
  });

  const { data: museums = [] } = useQuery({
    queryKey: ["museums-list"],
    queryFn: async () => {
      const res = await api.find("museums", { sort: "name", limit: 200 });
      return res.docs.map((d: any) => ({ id: d.id, name: d.name }));
    },
  });

  const { data: routes = [] } = useQuery({
    queryKey: ["routes-list"],
    queryFn: async () => {
      const res = await api.find("routes", { sort: "title", limit: 200 });
      return res.docs.map((d: any) => ({ id: d.id, title: d.title }));
    },
  });

  const createOutdoorStop = useMutation({
    mutationFn: async (payload: StopForm) => {
      return api.create("museum-outdoor-stops", {
        title: payload.title,
        description: payload.description || undefined,
        latitude: Number(payload.latitude),
        longitude: Number(payload.longitude),
        stopOrder: payload.stopOrder,
        museum: payload.relationId,
        markerColor: payload.markerColor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outdoor-stops"] });
      setOutdoorForm(emptyOutdoorForm);
      setCreatingOutdoor(false);
      toast({ title: "Outdoor stop created" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createRouteStop = useMutation({
    mutationFn: async (payload: StopForm) => {
      return api.create("route-stops", {
        title: payload.title,
        description: payload.description || undefined,
        latitude: Number(payload.latitude),
        longitude: Number(payload.longitude),
        stopOrder: payload.stopOrder,
        route: payload.relationId,
        markerColor: payload.markerColor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops"] });
      setRouteForm(emptyRouteForm);
      setCreatingRoute(false);
      toast({ title: "Route stop created" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOutdoorStop = useMutation({
    mutationFn: async (stop: OutdoorStop) => {
      return api.update("museum-outdoor-stops", stop.id, {
        title: stop.title,
        description: stop.description || undefined,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopOrder: stop.stopOrder,
        museum: relationId(stop.museum),
        markerColor: stop.markerColor,
        markerIcon: stop.markerIcon,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outdoor-stops"] });
      toast({ title: "Outdoor stop updated" });
      setEditingOutdoorStop(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRouteStop = useMutation({
    mutationFn: async (stop: RouteStop) => {
      return api.update("route-stops", stop.id, {
        title: stop.title,
        description: stop.description || undefined,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopOrder: stop.stopOrder,
        route: relationId(stop.route),
        markerColor: stop.markerColor,
        markerIcon: stop.markerIcon,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops"] });
      toast({ title: "Route stop updated" });
      setEditingRouteStop(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteOutdoorStop = useMutation({
    mutationFn: async (id: string) => api.delete("museum-outdoor-stops", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outdoor-stops"] });
      setDeleteOutdoorId(null);
      toast({ title: "Outdoor stop deleted" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRouteStop = useMutation({
    mutationFn: async (id: string) => api.delete("route-stops", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops"] });
      setDeleteRouteId(null);
      toast({ title: "Route stop deleted" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredOutdoorStops = outdoorStops.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRouteStops = routeStops.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const validate = (form: StopForm, relationLabel: string) => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return false;
    }
    if (!form.relationId) {
      toast({ title: `${relationLabel} is required`, variant: "destructive" });
      return false;
    }
    if (!form.latitude || !form.longitude) {
      toast({ title: "Coordinates are required", variant: "destructive" });
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Manage Stops</h2>
          <p className="text-sm text-muted-foreground">
            Create, edit, and remove outdoor and route stops
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stops..."
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="outdoor" className="gap-2">
            <Building2 className="h-4 w-4" />
            Outdoor Stops ({outdoorStops.length})
          </TabsTrigger>
          <TabsTrigger value="route" className="gap-2">
            <Route className="h-4 w-4" />
            Route Stops ({routeStops.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outdoor" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreatingOutdoor(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Outdoor Stop
            </Button>
          </div>

          {loadingOutdoor ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : filteredOutdoorStops.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No outdoor stops found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredOutdoorStops.map((stop) => (
                <Card
                  key={stop.id}
                  className="hover:border-primary/50 transition-colors"
                >
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: stop.markerColor || "#4B5573",
                        }}
                      >
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{stop.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {relationName(stop.museum)}
                          </Badge>
                          <span>
                            {stop.latitude.toFixed(4)},{" "}
                            {stop.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingOutdoorStop(stop)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteOutdoorId(stop.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="route" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreatingRoute(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Route Stop
            </Button>
          </div>

          {loadingRoute ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : filteredRouteStops.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No route stops found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredRouteStops.map((stop) => (
                <Card
                  key={stop.id}
                  className="hover:border-primary/50 transition-colors"
                >
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: stop.markerColor || "#F97316",
                        }}
                      >
                        <Route className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{stop.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {relationName(stop.route)}
                          </Badge>
                          <span>
                            {stop.latitude.toFixed(4)},{" "}
                            {stop.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRouteStop(stop)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteRouteId(stop.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={creatingOutdoor} onOpenChange={setCreatingOutdoor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Outdoor Stop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={outdoorForm.title}
                onChange={(e) =>
                  setOutdoorForm({ ...outdoorForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Museum *</Label>
              <Select
                value={outdoorForm.relationId}
                onValueChange={(value) =>
                  setOutdoorForm({ ...outdoorForm, relationId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select museum" />
                </SelectTrigger>
                <SelectContent>
                  {museums.map((museum) => (
                    <SelectItem key={museum.id} value={museum.id}>
                      {museum.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={outdoorForm.description}
                onChange={(e) =>
                  setOutdoorForm({
                    ...outdoorForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <LocationPickerMap
                latitude={outdoorForm.latitude}
                longitude={outdoorForm.longitude}
                onLocationChange={(lat, lng) =>
                  setOutdoorForm({
                    ...outdoorForm,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stop Order</Label>
                <Input
                  type="number"
                  min={1}
                  value={outdoorForm.stopOrder}
                  onChange={(e) =>
                    setOutdoorForm({
                      ...outdoorForm,
                      stopOrder: Number(e.target.value || 1),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Marker Color</Label>
                <Input
                  type="color"
                  value={outdoorForm.markerColor}
                  onChange={(e) =>
                    setOutdoorForm({
                      ...outdoorForm,
                      markerColor: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingOutdoor(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!validate(outdoorForm, "Museum")) return;
                createOutdoorStop.mutate(outdoorForm);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={creatingRoute} onOpenChange={setCreatingRoute}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Route Stop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={routeForm.title}
                onChange={(e) =>
                  setRouteForm({ ...routeForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Route *</Label>
              <Select
                value={routeForm.relationId}
                onValueChange={(value) =>
                  setRouteForm({ ...routeForm, relationId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={routeForm.description}
                onChange={(e) =>
                  setRouteForm({ ...routeForm, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <LocationPickerMap
                latitude={routeForm.latitude}
                longitude={routeForm.longitude}
                onLocationChange={(lat, lng) =>
                  setRouteForm({
                    ...routeForm,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stop Order</Label>
                <Input
                  type="number"
                  min={1}
                  value={routeForm.stopOrder}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      stopOrder: Number(e.target.value || 1),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Marker Color</Label>
                <Input
                  type="color"
                  value={routeForm.markerColor}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, markerColor: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingRoute(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!validate(routeForm, "Route")) return;
                createRouteStop.mutate(routeForm);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingOutdoorStop}
        onOpenChange={(open) => !open && setEditingOutdoorStop(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Outdoor Stop</DialogTitle>
          </DialogHeader>
          {editingOutdoorStop && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingOutdoorStop.title}
                  onChange={(e) =>
                    setEditingOutdoorStop({
                      ...editingOutdoorStop,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Museum</Label>
                <Select
                  value={relationId(editingOutdoorStop.museum)}
                  onValueChange={(value) =>
                    setEditingOutdoorStop({
                      ...editingOutdoorStop,
                      museum: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select museum" />
                  </SelectTrigger>
                  <SelectContent>
                    {museums.map((museum) => (
                      <SelectItem key={museum.id} value={museum.id}>
                        {museum.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingOutdoorStop.description || ""}
                  onChange={(e) =>
                    setEditingOutdoorStop({
                      ...editingOutdoorStop,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <LocationPickerMap
                  latitude={editingOutdoorStop.latitude}
                  longitude={editingOutdoorStop.longitude}
                  onLocationChange={(lat, lng) =>
                    setEditingOutdoorStop({
                      ...editingOutdoorStop,
                      latitude: lat,
                      longitude: lng,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stop Order</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editingOutdoorStop.stopOrder}
                    onChange={(e) =>
                      setEditingOutdoorStop({
                        ...editingOutdoorStop,
                        stopOrder: Number(e.target.value || 1),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marker Color</Label>
                  <Input
                    type="color"
                    value={editingOutdoorStop.markerColor || "#4B5573"}
                    onChange={(e) =>
                      setEditingOutdoorStop({
                        ...editingOutdoorStop,
                        markerColor: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingOutdoorStop(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                editingOutdoorStop &&
                updateOutdoorStop.mutate(editingOutdoorStop)
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingRouteStop}
        onOpenChange={(open) => !open && setEditingRouteStop(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Route Stop</DialogTitle>
          </DialogHeader>
          {editingRouteStop && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingRouteStop.title}
                  onChange={(e) =>
                    setEditingRouteStop({
                      ...editingRouteStop,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Route</Label>
                <Select
                  value={relationId(editingRouteStop.route)}
                  onValueChange={(value) =>
                    setEditingRouteStop({ ...editingRouteStop, route: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingRouteStop.description || ""}
                  onChange={(e) =>
                    setEditingRouteStop({
                      ...editingRouteStop,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <LocationPickerMap
                  latitude={editingRouteStop.latitude}
                  longitude={editingRouteStop.longitude}
                  onLocationChange={(lat, lng) =>
                    setEditingRouteStop({
                      ...editingRouteStop,
                      latitude: lat,
                      longitude: lng,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stop Order</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editingRouteStop.stopOrder}
                    onChange={(e) =>
                      setEditingRouteStop({
                        ...editingRouteStop,
                        stopOrder: Number(e.target.value || 1),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marker Color</Label>
                  <Input
                    type="color"
                    value={editingRouteStop.markerColor || "#F97316"}
                    onChange={(e) =>
                      setEditingRouteStop({
                        ...editingRouteStop,
                        markerColor: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRouteStop(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                editingRouteStop && updateRouteStop.mutate(editingRouteStop)
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteOutdoorId}
        onOpenChange={(open) => !open && setDeleteOutdoorId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete outdoor stop?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this outdoor stop and its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteOutdoorId && deleteOutdoorStop.mutate(deleteOutdoorId)
              }
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteRouteId}
        onOpenChange={(open) => !open && setDeleteRouteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete route stop?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this route stop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteRouteId && deleteRouteStop.mutate(deleteRouteId)
              }
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
