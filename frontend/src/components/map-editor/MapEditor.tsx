import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  Crosshair,
  Layers,
  ZoomIn,
  ZoomOut,
  MapPin,
  Route,
  Building2,
  Landmark,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons
const createCustomIcon = (
  color: string,
  type: "location" | "stop" | "museum" | "landmark" = "location",
) => {
  const icons = {
    location: `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>`,
    stop: `<circle cx="12" cy="12" r="8"/>`,
    museum: `<path d="M12 2L2 7h2v9h3v-5h2v5h2v-5h2v5h3V7h2L12 2z"/>`,
    landmark: `<path d="M12 2L4 12l8-2 8 2-8-10zm0 4l3.5 4.4L12 9.5l-3.5.9L12 6z"/>`,
  };

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        position: relative;
      ">
        <svg viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" style="width: 100%; height: 100%; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          ${icons[type]}
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export type MapStyle = "light" | "dark" | "satellite";
export type PinType =
  | "location"
  | "outdoor_stop"
  | "route_stop"
  | "museum"
  | "landmark";

export interface MapPin {
  id: string;
  type: PinType;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  color?: string;
}

export interface MapLayers {
  locations: boolean;
  outdoorStops: boolean;
  routeStops: boolean;
  museums: boolean;
  landmarks: boolean;
}

interface MapEditorProps {
  pins?: MapPin[];
  layers?: MapLayers;
  onLayersChange?: (layers: MapLayers) => void;
  onPinClick?: (pin: MapPin) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onPinDrag?: (pin: MapPin, lat: number, lng: number) => void;
  showAddPinMenu?: boolean;
  onAddPin?: (type: PinType, lat: number, lng: number) => void;
  selectedPinId?: string;
  mapStyle?: MapStyle;
  onMapStyleChange?: (style: MapStyle) => void;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  height?: string;
  showSearch?: boolean;
  showLayerControls?: boolean;
  showStyleControls?: boolean;
  draggablePins?: boolean;
}

function MapClickHandler({
  onMapClick,
  showAddPinMenu,
  onAddPin,
}: {
  onMapClick?: (lat: number, lng: number) => void;
  showAddPinMenu?: boolean;
  onAddPin?: (type: PinType, lat: number, lng: number) => void;
}) {
  const [clickPosition, setClickPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useMapEvents({
    click: (e) => {
      if (showAddPinMenu && onAddPin) {
        setClickPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        setShowMenu(true);
      } else if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  if (!showMenu || !clickPosition) return null;

  return (
    <Popup
      position={[clickPosition.lat, clickPosition.lng]}
      eventHandlers={{
        remove: () => setShowMenu(false),
      }}
    >
      <div className="p-2 space-y-2 min-w-[180px]">
        <p className="text-sm font-medium text-center mb-2">Create new:</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            onAddPin?.("location", clickPosition.lat, clickPosition.lng);
            setShowMenu(false);
          }}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Location
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            onAddPin?.("outdoor_stop", clickPosition.lat, clickPosition.lng);
            setShowMenu(false);
          }}
        >
          <Building2 className="h-4 w-4 mr-2" />
          Outdoor Stop
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            onAddPin?.("route_stop", clickPosition.lat, clickPosition.lng);
            setShowMenu(false);
          }}
        >
          <Route className="h-4 w-4 mr-2" />
          Route Stop
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            onAddPin?.("landmark", clickPosition.lat, clickPosition.lng);
            setShowMenu(false);
          }}
        >
          <Landmark className="h-4 w-4 mr-2" />
          Landmark
        </Button>
      </div>
    </Popup>
  );
}

function MapController({
  center,
  zoom,
}: {
  center?: [number, number];
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
}

function DraggableMarker({
  pin,
  icon,
  draggable,
  selected,
  onClick,
  onDragEnd,
}: {
  pin: MapPin;
  icon: L.DivIcon;
  draggable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onDragEnd?: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      click: () => onClick?.(),
      dragend: () => {
        const marker = markerRef.current;
        if (marker && onDragEnd) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(lat, lng);
        }
      },
    }),
    [onClick, onDragEnd],
  );

  return (
    <Marker
      ref={markerRef}
      position={[pin.lat, pin.lng]}
      icon={icon}
      draggable={draggable}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <div className="text-center">
          <p className="font-medium">{pin.title}</p>
          {pin.subtitle && (
            <p className="text-xs text-muted-foreground">{pin.subtitle}</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

const tileUrls: Record<MapStyle, string> = {
  light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

export function MapEditor({
  pins = [],
  layers = {
    locations: true,
    outdoorStops: true,
    routeStops: true,
    museums: true,
    landmarks: true,
  },
  onLayersChange,
  onPinClick,
  onMapClick,
  onPinDrag,
  showAddPinMenu = false,
  onAddPin,
  selectedPinId,
  mapStyle = "light",
  onMapStyleChange,
  defaultCenter = [-1.9403, 29.8739],
  defaultZoom = 12,
  height = "500px",
  showSearch = true,
  showLayerControls = true,
  showStyleControls = true,
  draggablePins = false,
}: MapEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [showLayersSheet, setShowLayersSheet] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      );
      const results = await response.json();
      if (results.length > 0) {
        const { lat, lon } = results[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("Geolocation error:", error),
      );
    }
  };

  const getIconForPin = useCallback((pin: MapPin) => {
    const typeMap: Record<
      PinType,
      "location" | "stop" | "museum" | "landmark"
    > = {
      location: "location",
      outdoor_stop: "stop",
      route_stop: "stop",
      museum: "museum",
      landmark: "landmark",
    };
    const colorMap: Record<PinType, string> = {
      location: pin.color || "#f97316",
      outdoor_stop: pin.color || "#4B5573",
      route_stop: pin.color || "#F97316",
      museum: pin.color || "#8B5CF6",
      landmark: pin.color || "#10B981",
    };
    return createCustomIcon(colorMap[pin.type], typeMap[pin.type]);
  }, []);

  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      if (pin.type === "location" && !layers.locations) return false;
      if (pin.type === "outdoor_stop" && !layers.outdoorStops) return false;
      if (pin.type === "route_stop" && !layers.routeStops) return false;
      if (pin.type === "museum" && !layers.museums) return false;
      if (pin.type === "landmark" && !layers.landmarks) return false;
      return true;
    });
  }, [pins, layers]);

  return (
    <div
      className="relative rounded-lg overflow-hidden border"
      style={{ height }}
    >
      {/* Top Controls */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center gap-2">
        {showSearch && (
          <div className="flex-1 flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search place..."
                className="pl-10 bg-background/95 backdrop-blur-sm shadow-sm"
              />
            </div>
            <Button
              size="icon"
              variant="secondary"
              onClick={handleSearch}
              disabled={searching}
              className="shadow-sm"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={handleCurrentLocation}
              title="Use current location"
              className="shadow-sm"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex gap-2 ml-auto">
          {showStyleControls && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="shadow-sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Style
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Map Style</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onMapStyleChange?.("light")}>
                  <span className={cn(mapStyle === "light" && "font-bold")}>
                    Light
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMapStyleChange?.("dark")}>
                  <span className={cn(mapStyle === "dark" && "font-bold")}>
                    Dark
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onMapStyleChange?.("satellite")}
                >
                  <span className={cn(mapStyle === "satellite" && "font-bold")}>
                    Satellite
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showLayerControls && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowLayersSheet(true)}
              className="shadow-sm"
            >
              <Layers className="h-4 w-4 mr-2" />
              Layers
            </Button>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url={tileUrls[mapStyle]}
        />
        <MapController center={mapCenter} />
        <MapClickHandler
          onMapClick={onMapClick}
          showAddPinMenu={showAddPinMenu}
          onAddPin={onAddPin}
        />

        {filteredPins.map((pin, index) => (
          <DraggableMarker
            key={`${pin.id}-${index}`}
            pin={pin}
            icon={getIconForPin(pin)}
            draggable={draggablePins}
            selected={pin.id === selectedPinId}
            onClick={() => onPinClick?.(pin)}
            onDragEnd={(lat, lng) => onPinDrag?.(pin, lat, lng)}
          />
        ))}
      </MapContainer>

      {/* Layers Sheet */}
      <Sheet open={showLayersSheet} onOpenChange={setShowLayersSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Map Layers</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <Label>Locations</Label>
              </div>
              <Switch
                checked={layers.locations}
                onCheckedChange={(checked) =>
                  onLayersChange?.({ ...layers, locations: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                <Label>Outdoor Stops</Label>
              </div>
              <Switch
                checked={layers.outdoorStops}
                onCheckedChange={(checked) =>
                  onLayersChange?.({ ...layers, outdoorStops: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-orange-500" />
                <Label>Route Stops</Label>
              </div>
              <Switch
                checked={layers.routeStops}
                onCheckedChange={(checked) =>
                  onLayersChange?.({ ...layers, routeStops: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-purple-500" />
                <Label>Museums</Label>
              </div>
              <Switch
                checked={layers.museums}
                onCheckedChange={(checked) =>
                  onLayersChange?.({ ...layers, museums: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-emerald-500" />
                <Label>Landmarks</Label>
              </div>
              <Switch
                checked={layers.landmarks}
                onCheckedChange={(checked) =>
                  onLayersChange?.({ ...layers, landmarks: checked })
                }
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
