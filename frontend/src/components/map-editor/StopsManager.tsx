import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Plus, Pencil, Trash2, Search, MapPin, Route, Building2 } from "lucide-react";
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

interface OutdoorStop {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  stop_order: number;
  museum_id: string;
  marker_color: string | null;
  marker_icon: string | null;
  museum?: { name: string };
}

interface RouteStop {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  stop_order: number;
  route_id: string;
  marker_color: string | null;
  marker_icon: string | null;
  route?: { title: string };
}

export function StopsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("outdoor");
  const [editingOutdoorStop, setEditingOutdoorStop] = useState<OutdoorStop | null>(null);
  const [editingRouteStop, setEditingRouteStop] = useState<RouteStop | null>(null);
  const [deleteOutdoorId, setDeleteOutdoorId] = useState<string | null>(null);
  const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);

  // Fetch outdoor stops
  const { data: outdoorStops = [], isLoading: loadingOutdoor } = useQuery({
    queryKey: ["outdoor-stops"],
    queryFn: async () => {
      const res = await api.find("museum-outdoor-stops", { sort: "stopOrder", limit: 500, depth: 1 });
      return res.docs as OutdoorStop[];
    },
  });

  // Fetch route stops
  const { data: routeStops = [], isLoading: loadingRoute } = useQuery({
    queryKey: ["route-stops"],
    queryFn: async () => {
      const res = await api.find("route-stops", { sort: "stopOrder", limit: 500, depth: 1 });
      return res.docs as RouteStop[];
    },
  });

  // Fetch museums for dropdown
  const { data: museums = [] } = useQuery({
    queryKey: ["museums-list"],
    queryFn: async () => {
      const res = await api.find("museums", { sort: "name", limit: 200 });
      return res.docs.map((d: any) => ({ id: d.id, name: d.name }));
    },
  });

  // Fetch routes for dropdown
  const { data: routes = [] } = useQuery({
    queryKey: ["routes-list"],
    queryFn: async () => {
      const res = await api.find("routes", { sort: "title", limit: 200 });
      return res.docs.map((d: any) => ({ id: d.id, title: d.title }));
    },
  });

  // Update outdoor stop mutation
  const updateOutdoorStop = useMutation({
    mutationFn: async (stop: Partial<OutdoorStop> & { id: string }) => {
      const { id, museum, ...data } = stop;
      await api.update("museum-outdoor-stops", id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outdoor-stops"] });
      toast({ title: "Outdoor stop updated" });
      setEditingOutdoorStop(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update route stop mutation
  const updateRouteStop = useMutation({
    mutationFn: async (stop: Partial<RouteStop> & { id: string }) => {
      const { id, route, marker_icon, ...data } = stop;
      await api.update("route-stops", id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops"] });
      toast({ title: "Route stop updated" });
      setEditingRouteStop(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete outdoor stop
  const deleteOutdoorStop = useMutation({
    mutationFn: async (id: string) => {
      await api.delete("museum-outdoor-stops", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outdoor-stops"] });
      toast({ title: "Outdoor stop deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete route stop
  const deleteRouteStop = useMutation({
    mutationFn: async (id: string) => {
      await api.delete("route-stops", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops"] });
      toast({ title: "Route stop deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredOutdoorStops = outdoorStops.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRouteStops = routeStops.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Manage Stops</h2>
          <p className="text-sm text-muted-foreground">
            Outdoor stops and route stops across all content
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

        <TabsContent value="outdoor" className="mt-4">
          {loadingOutdoor ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredOutdoorStops.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No outdoor stops found.</p>
                <p className="text-sm">Create outdoor stops in Museum Builder</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredOutdoorStops.map((stop) => (
                <Card key={stop.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: stop.marker_color || "#4B5573" }}
                      >
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{stop.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {stop.museum && (
                            <Badge variant="secondary" className="text-xs">
                              {stop.museum.name}
                            </Badge>
                          )}
                          <span>
                            {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
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

        <TabsContent value="route" className="mt-4">
          {loadingRoute ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredRouteStops.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No route stops found.</p>
                <p className="text-sm">Create route stops in Route Builder</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredRouteStops.map((stop) => (
                <Card key={stop.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: stop.marker_color || "#F97316" }}
                      >
                        <Route className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{stop.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {stop.route && (
                            <Badge variant="secondary" className="text-xs">
                              {stop.route.title}
                            </Badge>
                          )}
                          <span>
                            {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
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

      {/* Edit Outdoor Stop Dialog */}
      <Dialog open={!!editingOutdoorStop} onOpenChange={(open) => !open && setEditingOutdoorStop(null)}>
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
                    setEditingOutdoorStop({ ...editingOutdoorStop, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingOutdoorStop.description || ""}
                  onChange={(e) =>
                    setEditingOutdoorStop({ ...editingOutdoorStop, description: e.target.value })
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
                    setEditingOutdoorStop({ ...editingOutdoorStop, latitude: lat, longitude: lng })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Marker Color</Label>
                <Input
                  type="color"
                  value={editingOutdoorStop.marker_color || "#4B5573"}
                  onChange={(e) =>
                    setEditingOutdoorStop({ ...editingOutdoorStop, marker_color: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOutdoorStop(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingOutdoorStop && updateOutdoorStop.mutate(editingOutdoorStop)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Route Stop Dialog */}
      <Dialog open={!!editingRouteStop} onOpenChange={(open) => !open && setEditingRouteStop(null)}>
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
                    setEditingRouteStop({ ...editingRouteStop, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingRouteStop.description || ""}
                  onChange={(e) =>
                    setEditingRouteStop({ ...editingRouteStop, description: e.target.value })
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
                    setEditingRouteStop({ ...editingRouteStop, latitude: lat, longitude: lng })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Marker Color</Label>
                <Input
                  type="color"
                  value={editingRouteStop.marker_color || "#F97316"}
                  onChange={(e) =>
                    setEditingRouteStop({ ...editingRouteStop, marker_color: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRouteStop(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingRouteStop && updateRouteStop.mutate(editingRouteStop)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={!!deleteOutdoorId} onOpenChange={(open) => !open && setDeleteOutdoorId(null)}>
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
              onClick={() => deleteOutdoorId && deleteOutdoorStop.mutate(deleteOutdoorId)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteRouteId} onOpenChange={(open) => !open && setDeleteRouteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete route stop?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this route stop and its content blocks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRouteId && deleteRouteStop.mutate(deleteRouteId)}
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
