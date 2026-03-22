/**
 * MapScreen — Full-screen Mapbox map with live POI markers.
 */

import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { useQuery } from "@tanstack/react-query";
import * as ExpoLocation from "expo-location";
import { Locate, Layers } from "lucide-react-native";
import { api } from "@/lib/api";
import type { MapPoint, RouteLine } from "@shared/types";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || "");

const TYPE_COLORS: Record<string, string> = {
  museum: "#6366f1",
  location: "#0d9488",
  route_stop: "#f59e0b",
  outdoor_stop: "#dc2626",
  story: "#8b5cf6",
};

export default function MapScreen() {
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  // Load all map data
  const { data, isLoading } = useQuery({
    queryKey: ["map-layers"],
    queryFn: async () => {
      const result = await api.layers();
      return {
        points: (result.layers || []) as MapPoint[],
        routeLines: (result.routeLines || []) as RouteLine[],
      };
    },
  });

  // User location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await ExpoLocation.getCurrentPositionAsync({});
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    })();
  }, []);

  const centerOnUser = () => {
    if (userLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: [userLocation.lng, userLocation.lat],
        zoomLevel: 14,
        animationDuration: 800,
      });
    }
  };

  // Build GeoJSON from points
  const pointsGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: (data?.points || []).map((p) => ({
      type: "Feature",
      id: p.id,
      geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
      properties: {
        id: p.id,
        title: p.title,
        type: p.type,
        color: TYPE_COLORS[p.type] || "#6366f1",
      },
    })),
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-slate-500">Loading map...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapboxGL.MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/light-v11"
        logoEnabled={false}
        compassEnabled
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [29.87, -1.94],
            zoomLevel: 8,
          }}
        />

        {/* User location */}
        <MapboxGL.UserLocation visible animated />

        {/* POI markers */}
        <MapboxGL.ShapeSource
          id="pois"
          shape={pointsGeoJSON}
          onPress={(e) => {
            const feature = e.features?.[0];
            if (feature?.properties) {
              const p = data?.points.find((pt) => pt.id === feature.properties?.id);
              setSelectedPoint(p || null);
            }
          }}
        >
          <MapboxGL.CircleLayer
            id="poi-circles"
            style={{
              circleRadius: 8,
              circleColor: ["get", "color"],
              circleStrokeColor: "#ffffff",
              circleStrokeWidth: 2,
            }}
          />
        </MapboxGL.ShapeSource>

        {/* Route lines */}
        {data?.routeLines.map((route) => (
          <MapboxGL.ShapeSource
            key={route.routeId}
            id={`route-${route.routeId}`}
            shape={{
              type: "Feature",
              geometry: route.path,
              properties: {},
            }}
          >
            <MapboxGL.LineLayer
              id={`route-line-${route.routeId}`}
              style={{
                lineColor: route.color || "#6366f1",
                lineWidth: 3,
                lineOpacity: 0.7,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </MapboxGL.ShapeSource>
        ))}
      </MapboxGL.MapView>

      {/* Controls */}
      <View className="absolute top-16 right-4 gap-2">
        <Pressable
          onPress={centerOnUser}
          className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-md"
        >
          <Locate size={20} color="#1a1a2e" />
        </Pressable>
      </View>

      {/* Selected point card */}
      {selectedPoint && (
        <View className="absolute bottom-28 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg">
          <Text className="font-bold text-base">{selectedPoint.title}</Text>
          <Text className="text-xs text-slate-500 mt-1 capitalize">{selectedPoint.type.replace("_", " ")}</Text>
          {selectedPoint.distanceKm !== undefined && (
            <Text className="text-xs text-teal-600 mt-1">
              {selectedPoint.distanceKm.toFixed(1)} km away
            </Text>
          )}
          <Pressable
            onPress={() => setSelectedPoint(null)}
            className="absolute top-3 right-3"
          >
            <Text className="text-slate-400 text-lg">×</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
