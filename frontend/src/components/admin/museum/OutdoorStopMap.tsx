import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MuseumOutdoorStop, Museum } from "@/hooks/useMuseumAdmin";

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const createIcon = (color: string, isSelected: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${isSelected ? "32px" : "24px"};
        height: ${isSelected ? "32px" : "24px"};
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${isSelected ? "14px" : "12px"};
        font-weight: bold;
        transition: all 0.2s;
      "></div>
    `,
    iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
    iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
  });
};

interface DraggableMarkerProps {
  stop: MuseumOutdoorStop;
  isSelected: boolean;
  onSelect: (stop: MuseumOutdoorStop) => void;
  onDragEnd: (stopId: string, lat: number, lng: number) => void;
}

function DraggableMarker({ stop, isSelected, onSelect, onDragEnd }: DraggableMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  
  const icon = useMemo(
    () => createIcon(stop.marker_color || "#4B5573", isSelected),
    [stop.marker_color, isSelected]
  );

  const eventHandlers = useMemo(
    () => ({
      click: () => onSelect(stop),
      dragend: () => {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(stop.id, lat, lng);
        }
      },
    }),
    [stop, onSelect, onDragEnd]
  );

  return (
    <Marker
      ref={markerRef}
      position={[stop.latitude, stop.longitude]}
      icon={icon}
      draggable={true}
      eventHandlers={eventHandlers}
    />
  );
}

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
}

function MapCenter({ center }: MapCenterProps) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

interface OutdoorStopMapProps {
  museum: Museum;
  stops: MuseumOutdoorStop[];
  selectedStopId: string | null;
  onStopSelect: (stop: MuseumOutdoorStop) => void;
  onMapClick: (lat: number, lng: number) => void;
  onStopDrag: (stopId: string, lat: number, lng: number) => void;
}

export function OutdoorStopMap({
  museum,
  stops,
  selectedStopId,
  onStopSelect,
  onMapClick,
  onStopDrag,
}: OutdoorStopMapProps) {
  const center: [number, number] = [
    museum.latitude || -1.9403,
    museum.longitude || 29.8739,
  ];

  return (
    <div className="h-[400px] rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={17}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={onMapClick} />
        <MapCenter center={center} />
        {stops.map((stop) => (
          <DraggableMarker
            key={stop.id}
            stop={stop}
            isSelected={selectedStopId === stop.id}
            onSelect={onStopSelect}
            onDragEnd={onStopDrag}
          />
        ))}
      </MapContainer>
    </div>
  );
}
