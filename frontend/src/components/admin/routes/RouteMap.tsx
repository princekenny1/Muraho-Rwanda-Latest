import { useEffect, useRef } from "react";
import type { RouteStop } from "@/types/routes";

interface RouteMapProps {
  stops: RouteStop[];
  selectedStopId: string | null;
  isAddingStop?: boolean;
  pendingLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  onStopSelect?: (stopId: string) => void;
  onStopMove?: (stopId: string, lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [-1.9403, 29.8739]; // Kigali
const DEFAULT_ZOOM = 13;

export function RouteMap({
  stops,
  selectedStopId,
  isAddingStop = false,
  pendingLocation,
  onMapClick,
  onStopSelect,
  onStopMove,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamic import of Leaflet
    const initMap = async () => {
      const L = (await import("leaflet")).default;

      const map = L.map(mapRef.current!, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      map.on("click", (e: any) => {
        if (isAddingStop && onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });

      leafletMapRef.current = map;
    };

    initMap();

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update click handler when isAddingStop changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    map.off("click");
    map.on("click", (e: any) => {
      if (isAddingStop && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    if (isAddingStop) {
      map.getContainer().style.cursor = "crosshair";
    } else {
      map.getContainer().style.cursor = "";
    }
  }, [isAddingStop, onMapClick]);

  // Update markers and polyline when stops change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      const validStops = stops.filter((s) => s.latitude && s.longitude);

      // Add markers
      validStops.forEach((stop, index) => {
        const isSelected = stop.id === selectedStopId;

        const icon = L.divIcon({
          className: "custom-stop-marker",
          html: `<div style="
            width: 28px; height: 28px; border-radius: 50%;
            background: ${isSelected ? "#f59e0b" : stop.marker_color || "#3b82f6"};
            border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 12px; font-weight: bold;
          ">${index + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([stop.latitude!, stop.longitude!], {
          icon,
          draggable: !!onStopMove,
        }).addTo(map);

        marker.bindTooltip(stop.title || `Stop ${index + 1}`, {
          direction: "top",
          offset: [0, -16],
        });

        marker.on("click", () => onStopSelect?.(stop.id));

        if (onStopMove) {
          marker.on("dragend", (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            onStopMove(stop.id, lat, lng);
          });
        }

        markersRef.current.push(marker);
      });

      // Draw route polyline
      if (validStops.length >= 2) {
        const coords = validStops.map((s) => [s.latitude!, s.longitude!] as [number, number]);
        polylineRef.current = L.polyline(coords, {
          color: "#3b82f6",
          weight: 3,
          opacity: 0.7,
          dashArray: "8, 8",
        }).addTo(map);
      }

      // Fit bounds
      if (validStops.length > 0) {
        const bounds = L.latLngBounds(
          validStops.map((s) => [s.latitude!, s.longitude!] as [number, number])
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    };

    updateMarkers();
  }, [stops, selectedStopId, onStopSelect, onStopMove]);

  // Show pending location marker
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !pendingLocation) return;

    let pendingMarker: any = null;

    const showPending = async () => {
      const L = (await import("leaflet")).default;
      const icon = L.divIcon({
        className: "pending-marker",
        html: `<div style="
          width: 32px; height: 32px; border-radius: 50%;
          background: #f59e0b; border: 3px dashed white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 16px;
        ">+</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      pendingMarker = L.marker([pendingLocation.lat, pendingLocation.lng], { icon }).addTo(map);
    };

    showPending();

    return () => {
      pendingMarker?.remove();
    };
  }, [pendingLocation]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[400px] rounded-lg"
      style={{ zIndex: 0 }}
    />
  );
}
