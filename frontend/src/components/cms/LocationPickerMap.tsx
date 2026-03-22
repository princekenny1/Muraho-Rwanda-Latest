import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const customIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: hsl(var(--primary));
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapCenterProps {
  center: [number, number];
  zoom?: number;
}

function MapCenter({ center, zoom }: MapCenterProps) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  
  return null;
}

interface DraggableMarkerProps {
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}

function DraggableMarker({ position, onDragEnd }: DraggableMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend: () => {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(lat, lng);
        }
      },
    }),
    [onDragEnd]
  );

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={customIcon}
      draggable={true}
      eventHandlers={eventHandlers}
    />
  );
}

interface LocationPickerMapProps {
  latitude?: number | string;
  longitude?: number | string;
  onLocationChange: (lat: number, lng: number) => void;
}

export function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerMapProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.9403, 29.8739]); // Rwanda default
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  // Initialize with existing coordinates
  useEffect(() => {
    const lat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === "string" ? parseFloat(longitude) : longitude;
    
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      setSelectedPosition([lat, lng]);
      setMapCenter([lat, lng]);
    }
  }, [latitude, longitude]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
  };

  const handleDragEnd = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      // Using Nominatim for geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const results = await response.json();
      
      if (results.length > 0) {
        const { lat, lon } = results[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setMapCenter([newLat, newLng]);
        setSelectedPosition([newLat, newLng]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onLocationChange(selectedPosition[0], selectedPosition[1]);
      setOpen(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setMapCenter([lat, lng]);
          setSelectedPosition([lat, lng]);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  const hasCoordinates = latitude && longitude;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        onClick={() => setOpen(true)}
      >
        <MapPin className="h-4 w-4 mr-2" />
        {hasCoordinates
          ? `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`
          : "Pick location on map"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Pick Location</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search for a place..."
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleUseCurrentLocation}
                title="Use current location"
              >
                <Crosshair className="h-4 w-4" />
              </Button>
            </div>

            {/* Map */}
            <div className="h-[400px] rounded-lg overflow-hidden border">
              <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                <MapCenter center={mapCenter} />
                {selectedPosition && (
                  <DraggableMarker
                    position={selectedPosition}
                    onDragEnd={handleDragEnd}
                  />
                )}
              </MapContainer>
            </div>

            {/* Coordinates display */}
            {selectedPosition && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <span className="font-medium">Selected:</span>{" "}
                  {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Click on the map or drag the marker to set the exact location.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedPosition}>
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
