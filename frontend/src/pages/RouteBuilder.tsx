import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Globe, Eye, Settings, Plus, Calculator } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/lib/api/client";
import { useAuth } from "@/hooks/useAuth";
import { useRouteAdmin, useRouteStops, useRouteStopMutations } from "@/hooks/useRouteAdmin";
import { useToast } from "@/hooks/use-toast";
import { RouteMap } from "@/components/admin/routes/RouteMap";
import { StopList } from "@/components/admin/routes/StopList";
import { StopEditor } from "@/components/admin/routes/StopEditor";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Car, Footprints, Bike } from "lucide-react";
import { 
  calculateRouteDistance, 
  calculateTotalDuration,
  formatDistance,
  formatDuration 
} from "@/lib/routeCalculations";
import type { Route, RouteStop, RouteDifficulty } from "@/types/routes";

type TravelMode = "walking" | "driving" | "cycling";

export default function RouteBuilder() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { updateRoute, publishRoute } = useRouteAdmin();
  const { data: stops = [] } = useRouteStops(routeId || undefined);
  const { createStop, updateStop, deleteStop, reorderStops } = useRouteStopMutations();

  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Form state for route settings
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>();
  const [difficulty, setDifficulty] = useState<RouteDifficulty>("moderate");
  const [distanceKm, setDistanceKm] = useState<number | undefined>();
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");

  useEffect(() => {
    const fetchRoute = async () => {
      if (!routeId) return;
      
      const data = await api.findById("routes", routeId);

      if (!data) {
        toast({ title: "Error loading route", description: "Route not found", variant: "destructive" });
        navigate("/admin/routes");
        return;
      }

      const routeData = data as Route;
      setRoute(routeData);
      setTitle(routeData.title);
      setDescription(routeData.description || "");
      setCoverImage(routeData.cover_image || "");
      setDurationMinutes(routeData.duration_minutes || undefined);
      setDifficulty(routeData.difficulty);
      setDistanceKm(routeData.distance_km ? Number(routeData.distance_km) : undefined);
      setLoading(false);
    };

    fetchRoute();
  }, [routeId, navigate, toast]);

  // Auto-calculate distance and duration when stops change
  const recalculateRoute = useCallback(async (mode: TravelMode = travelMode) => {
    if (!routeId || stops.length < 2) return;
    
    const distance = calculateRouteDistance(stops);
    const duration = calculateTotalDuration(distance, stops, mode);
    
    setDistanceKm(distance);
    setDurationMinutes(duration);
    
    // Auto-save to database
    await updateRoute(routeId, {
      distance_km: distance,
      duration_minutes: duration,
    });
    
    setRoute(prev => prev ? { ...prev, distance_km: distance, duration_minutes: duration } : prev);
  }, [routeId, stops, updateRoute, travelMode]);

  // Handle travel mode change
  const handleTravelModeChange = (mode: TravelMode) => {
    setTravelMode(mode);
    recalculateRoute(mode);
  };

  // Recalculate when stops change
  useEffect(() => {
    if (stops.length >= 2) {
      recalculateRoute();
    }
  }, [stops.length, recalculateRoute]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Route Not Found</h1>
          <Button variant="outline" onClick={() => navigate("/admin/routes")}>
            Back to Routes
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    if (!routeId) return;
    
    const success = await updateRoute(routeId, {
      title,
      description: description || null,
      cover_image: coverImage || null,
      duration_minutes: durationMinutes || null,
      difficulty,
      distance_km: distanceKm || null,
    });

    if (success) {
      setRoute({ ...route, title, description, cover_image: coverImage, duration_minutes: durationMinutes || null, difficulty, distance_km: distanceKm || null });
      setShowSettings(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingStop) {
      setPendingLocation({ lat, lng });
    }
  };

  const handleCreateStop = async (data: { title: string; description?: string }) => {
    if (!pendingLocation) return;
    
    await createStop({
      title: data.title,
      description: data.description,
      latitude: pendingLocation.lat,
      longitude: pendingLocation.lng,
    });
    
    setPendingLocation(null);
    setIsAddingStop(false);
  };

  const handleStopSelect = (stopId: string) => {
    setSelectedStopId(stopId);
  };

  const handleStopMove = async (stopId: string, lat: number, lng: number) => {
    await updateStop(stopId, { latitude: lat, longitude: lng });
  };

  const selectedStop = stops.find(s => s.id === selectedStopId);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/routes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">{route.title}</h1>
            <p className="text-xs text-muted-foreground">
              {stops.length} stops
              {distanceKm ? ` · ${formatDistance(distanceKm)}` : ""}
              {durationMinutes ? ` · ${formatDuration(durationMinutes)}` : ""}
              {" · "}{route.status === "published" ? "Published" : "Draft"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/routes/${route.slug}`)}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          {route.status === "draft" ? (
            <Button size="sm" onClick={() => publishRoute(route.id)}>
              <Globe className="h-4 w-4 mr-1" />
              Publish
            </Button>
          ) : (
            <Button variant="secondary" size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Canvas */}
        <div className="flex-1 relative">
          <RouteMap
            stops={stops}
            selectedStopId={selectedStopId}
            isAddingStop={isAddingStop}
            pendingLocation={pendingLocation}
            onMapClick={handleMapClick}
            onStopSelect={handleStopSelect}
            onStopMove={handleStopMove}
          />
          
          {/* Add Stop Mode Indicator */}
          {isAddingStop && (
            <div className="absolute top-4 left-4 right-4 bg-amber/90 text-midnight px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-between">
              <span>Click on the map to place a new stop</span>
              <Button variant="ghost" size="sm" onClick={() => { setIsAddingStop(false); setPendingLocation(null); }}>
                Cancel
              </Button>
            </div>
          )}

          {/* Pending Stop Form */}
          {pendingLocation && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold mb-3">New Stop</h3>
              <CreateStopForm 
                onSubmit={handleCreateStop} 
                onCancel={() => { setPendingLocation(null); setIsAddingStop(false); }}
                location={pendingLocation}
              />
            </div>
          )}
        </div>

        {/* Stop List Sidebar */}
        <div className="w-80 border-l flex flex-col bg-muted/30">
          <div className="p-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm">Route Stops</h2>
            <Button 
              size="sm" 
              variant={isAddingStop ? "secondary" : "default"}
              onClick={() => setIsAddingStop(!isAddingStop)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Stop
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <StopList
              stops={stops}
              selectedStopId={selectedStopId}
              onSelect={handleStopSelect}
              onReorder={reorderStops}
              onDelete={deleteStop}
            />
          </div>
        </div>

        {/* Stop Editor Panel */}
        {selectedStop && (
          <StopEditor
            stop={selectedStop}
            onUpdate={updateStop}
            onClose={() => setSelectedStopId(null)}
          />
        )}
      </div>

      {/* Route Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Route Settings</SheetTitle>
            <SheetDescription>
              Configure route details and metadata
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Distance & Duration</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => recalculateRoute()}
                  disabled={stops.length < 2}
                >
                  <Calculator className="h-3 w-3 mr-1" />
                  Recalculate
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Travel Mode</Label>
                <ToggleGroup 
                  type="single" 
                  value={travelMode} 
                  onValueChange={(v) => v && handleTravelModeChange(v as TravelMode)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="walking" aria-label="Walking" className="flex items-center gap-1">
                    <Footprints className="h-4 w-4" />
                    <span className="text-xs">Walk</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="cycling" aria-label="Cycling" className="flex items-center gap-1">
                    <Bike className="h-4 w-4" />
                    <span className="text-xs">Bike</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="driving" aria-label="Driving" className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    <span className="text-xs">Drive</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              {stops.length < 2 ? (
                <p className="text-xs text-muted-foreground">Add at least 2 stops to calculate distance</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="font-semibold">{distanceKm ? formatDistance(distanceKm) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Duration</p>
                    <p className="font-semibold">{durationMinutes ? formatDuration(durationMinutes) : "—"}</p>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Duration includes travel time ({travelMode}) + time at each stop
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as RouteDifficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="challenging">Challenging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveSettings} className="flex-1">
                Save Settings
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Simple inline form for creating a stop
function CreateStopForm({ 
  onSubmit, 
  onCancel, 
  location 
}: { 
  onSubmit: (data: { title: string; description?: string }) => void;
  onCancel: () => void;
  location: { lat: number; lng: number };
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Location: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
      </p>
      <div className="space-y-2">
        <Label htmlFor="stopTitle">Stop Name *</Label>
        <Input
          id="stopTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Kigali Viewpoint"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="stopDesc">Description</Label>
        <Textarea
          id="stopDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={() => onSubmit({ title, description: description || undefined })}
          disabled={!title.trim()}
          className="flex-1"
        >
          Add Stop
        </Button>
      </div>
    </div>
  );
}
