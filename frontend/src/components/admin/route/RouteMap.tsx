import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RouteStop } from "@/types/routes";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface RouteMapProps {
  stops: RouteStop[];
  selectedStopId: string | null;
  isAddingStop: boolean;
  pendingLocation: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
  onStopSelect: (stopId: string) => void;
  onStopMove: (stopId: string, lat: number, lng: number) => void;
}

export function RouteMap({
  stops,
  selectedStopId,
  isAddingStop,
  pendingLocation,
  onMapClick,
  onStopSelect,
  onStopMove,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);
  const pendingMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-1.9403, 29.8739], // Rwanda center
      zoom: 8,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map clicks
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isAddingStop) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on("click", handleClick);
    
    // Update cursor style
    if (mapRef.current) {
      mapRef.current.style.cursor = isAddingStop ? "crosshair" : "grab";
    }

    return () => {
      map.off("click", handleClick);
    };
  }, [isAddingStop, onMapClick]);

  // Update markers when stops change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers not in stops
    markersRef.current.forEach((marker, id) => {
      if (!stops.find(s => s.id === id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add/update markers for each stop
    stops.forEach((stop, index) => {
      let marker = markersRef.current.get(stop.id);

      const isSelected = stop.id === selectedStopId;
      const icon = createStopIcon(index + 1, stop.marker_color, isSelected);

      if (marker) {
        marker.setLatLng([stop.latitude, stop.longitude]);
        marker.setIcon(icon);
      } else {
        marker = L.marker([stop.latitude, stop.longitude], {
          icon,
          draggable: true,
        })
          .addTo(map)
          .on("click", () => onStopSelect(stop.id))
          .on("dragend", (e) => {
            const newLatLng = (e.target as L.Marker).getLatLng();
            onStopMove(stop.id, newLatLng.lat, newLatLng.lng);
          });

        marker.bindTooltip(stop.title, { permanent: false, direction: "top" });
        markersRef.current.set(stop.id, marker);
      }
    });

    // Update/create route polyline
    if (stops.length > 1) {
      const latlngs = stops
        .sort((a, b) => a.stop_order - b.stop_order)
        .map(s => [s.latitude, s.longitude] as [number, number]);

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latlngs);
      } else {
        polylineRef.current = L.polyline(latlngs, {
          color: "#F97316",
          weight: 3,
          opacity: 0.7,
          dashArray: "10, 10",
        }).addTo(map);
      }
    } else if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Fit bounds if we have stops
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [stops, selectedStopId, onStopSelect, onStopMove]);

  // Show pending location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pendingLocation) {
      if (pendingMarkerRef.current) {
        pendingMarkerRef.current.setLatLng([pendingLocation.lat, pendingLocation.lng]);
      } else {
        pendingMarkerRef.current = L.marker([pendingLocation.lat, pendingLocation.lng], {
          icon: createPendingIcon(),
        }).addTo(map);
      }
    } else if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }
  }, [pendingLocation]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}

function createStopIcon(number: number, color: string, isSelected: boolean) {
  return L.divIcon({
    className: "custom-stop-marker",
    html: `
      <div style="
        width: ${isSelected ? "36px" : "30px"};
        height: ${isSelected ? "36px" : "30px"};
        background-color: ${color};
        border: 3px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.8)"};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${isSelected ? "14px" : "12px"};
        box-shadow: ${isSelected ? "0 4px 12px rgba(0,0,0,0.4)" : "0 2px 6px rgba(0,0,0,0.3)"};
        transform: translate(-50%, -50%);
        transition: all 0.2s ease;
      ">
        ${number}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createPendingIcon() {
  return L.divIcon({
    className: "pending-stop-marker",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: #22c55e;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
        animation: pulse 1s infinite;
      ">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
      </style>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}
