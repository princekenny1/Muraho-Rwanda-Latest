import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import {
  ArrowLeft,
  MapPin,
  Route,
  Building2,
  Landmark,
  Layers,
  Settings,
  Map as MapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import {
  MapEditor,
  MapPin as MapPinType,
  MapLayers,
  MapStyle,
  PinType,
  StopsManager,
  LandmarksManager,
  MapSettingsPanel,
} from "@/components/map-editor";
import { LocationManager } from "@/components/cms/LocationManager";

export default function MapControlPanel() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [mapStyle, setMapStyle] = useState<MapStyle>("light");
  const [layers, setLayers] = useState<MapLayers>({
    locations: true,
    outdoorStops: true,
    routeStops: true,
    museums: true,
    landmarks: true,
  });

  // Fetch all map data
  const { data: locations = [] } = useQuery({
    queryKey: ["map-locations"],
    queryFn: async () => {
      const res = await api.find("locations", {
        where: {
          and: [
            { latitude: { exists: true } },
            { longitude: { exists: true } },
          ],
        },
        limit: 500,
      });
      return res.docs;
    },
  });

  const { data: outdoorStops = [] } = useQuery({
    queryKey: ["map-outdoor-stops"],
    queryFn: async () => {
      const res = await api.find("museum-outdoor-stops", { depth: 1, limit: 500 });
      return res.docs;
    },
  });

  const { data: routeStops = [] } = useQuery({
    queryKey: ["map-route-stops"],
    queryFn: async () => {
      const res = await api.find("route-stops", { depth: 1, limit: 500 });
      return res.docs;
    },
  });

  const { data: museums = [] } = useQuery({
    queryKey: ["map-museums"],
    queryFn: async () => {
      const res = await api.find("museums", {
        where: {
          and: [
            { latitude: { exists: true } },
            { longitude: { exists: true } },
          ],
        },
        limit: 200,
      });
      return res.docs;
    },
  });

  // Convert to map pins
  const pins = useMemo<MapPinType[]>(() => {
    const result: MapPinType[] = [];

    // Locations
    locations.forEach((loc) => {
      if (loc.latitude && loc.longitude) {
        result.push({
          id: loc.id,
          type: "location",
          lat: Number(loc.latitude),
          lng: Number(loc.longitude),
          title: loc.name,
          subtitle: loc.location_type || undefined,
          color: "#f97316",
        });
      }
    });

    // Outdoor stops
    outdoorStops.forEach((stop) => {
      result.push({
        id: stop.id,
        type: "outdoor_stop",
        lat: Number(stop.latitude),
        lng: Number(stop.longitude),
        title: stop.title,
        subtitle: stop.museum?.name,
        color: stop.marker_color || "#4B5573",
      });
    });

    // Route stops
    routeStops.forEach((stop) => {
      result.push({
        id: stop.id,
        type: "route_stop",
        lat: Number(stop.latitude),
        lng: Number(stop.longitude),
        title: stop.title,
        subtitle: stop.route?.title,
        color: stop.marker_color || "#F97316",
      });
    });

    // Museums
    museums.forEach((museum) => {
      if (museum.latitude && museum.longitude) {
        result.push({
          id: museum.id,
          type: "museum",
          lat: Number(museum.latitude),
          lng: Number(museum.longitude),
          title: museum.name,
          color: "#8B5CF6",
        });
      }
    });

    return result;
  }, [locations, outdoorStops, routeStops, museums]);

  const handlePinClick = (pin: MapPinType) => {
    // Navigate to appropriate editor based on type
    switch (pin.type) {
      case "museum":
        navigate(`/admin/museums/${pin.id}`);
        break;
      case "route_stop":
        // Find the route and navigate
        const routeStop = routeStops.find((s) => s.id === pin.id);
        if (routeStop?.route) {
          // Navigate to route builder
          setActiveTab("stops");
        }
        break;
      default:
        setActiveTab("locations");
    }
  };

  const handleAddPin = (type: PinType, lat: number, lng: number) => {
    // Open appropriate create form based on type
    switch (type) {
      case "location":
        setActiveTab("locations");
        break;
      case "outdoor_stop":
      case "route_stop":
        setActiveTab("stops");
        break;
      case "landmark":
        setActiveTab("landmarks");
        break;
    }
  };

  const stats = {
    locations: locations.length,
    outdoorStops: outdoorStops.length,
    routeStops: routeStops.length,
    museums: museums.length,
    totalPins: pins.length,
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Map Control Panel</h1>
              <p className="text-sm text-muted-foreground">
                Manage all map-based data for routes, museums, stops & places
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
            <TabsTrigger value="stops" className="gap-2">
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">Stops</span>
            </TabsTrigger>
            <TabsTrigger value="landmarks" className="gap-2">
              <Landmark className="h-4 w-4" />
              <span className="hidden sm:inline">Landmarks</span>
            </TabsTrigger>
            <TabsTrigger value="layers" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Layers</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.locations}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    Outdoor Stops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.outdoorStops}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Route className="h-4 w-4 text-orange-500" />
                    Route Stops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.routeStops}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-purple-500" />
                    Museums
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.museums}</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Pins</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.totalPins}</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Map */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Map</CardTitle>
                <CardDescription>
                  Click on the map to add new pins. Click existing pins to edit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MapEditor
                  pins={pins}
                  layers={layers}
                  onLayersChange={setLayers}
                  mapStyle={mapStyle}
                  onMapStyleChange={setMapStyle}
                  onPinClick={handlePinClick}
                  showAddPinMenu={true}
                  onAddPin={handleAddPin}
                  height="500px"
                  draggablePins={false}
                />
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setActiveTab("locations")}
              >
                <CardHeader className="pb-2">
                  <MapPin className="h-8 w-8 text-orange-500 mb-2" />
                  <CardTitle>Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Manage named places & coordinates
                  </CardDescription>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setActiveTab("stops")}
              >
                <CardHeader className="pb-2">
                  <Route className="h-8 w-8 text-orange-500 mb-2" />
                  <CardTitle>Stops</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Manage outdoor & route stops
                  </CardDescription>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate("/admin/routes")}
              >
                <CardHeader className="pb-2">
                  <MapIcon className="h-8 w-8 text-amber-500 mb-2" />
                  <CardTitle>Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Open Route Builder
                  </CardDescription>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate("/admin/museums")}
              >
                <CardHeader className="pb-2">
                  <Landmark className="h-8 w-8 text-purple-500 mb-2" />
                  <CardTitle>Museums</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Open Museum Builder
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <LocationManager />
          </TabsContent>

          {/* Stops Tab */}
          <TabsContent value="stops">
            <StopsManager />
          </TabsContent>

          {/* Landmarks Tab */}
          <TabsContent value="landmarks">
            <LandmarksManager />
          </TabsContent>

          {/* Layers Tab */}
          <TabsContent value="layers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Map with Layer Controls</CardTitle>
                <CardDescription>
                  Toggle different content layers to customize the map view
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MapEditor
                  pins={pins}
                  layers={layers}
                  onLayersChange={setLayers}
                  mapStyle={mapStyle}
                  onMapStyleChange={setMapStyle}
                  onPinClick={handlePinClick}
                  height="600px"
                  showLayerControls={true}
                  showStyleControls={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <MapSettingsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
