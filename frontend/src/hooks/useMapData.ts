/**
 * useMapData — Spatial data hook for all map components
 * Replaces hardcoded/mock data with live Payload spatial API queries.
 *
 * Usage:
 *   const { points, routeLines, isLoading } = useMapLayers({ center, radiusKm });
 *   const { points } = useNearby({ latitude, longitude, radiusKm: 5 });
 *   const { geojson } = useRouteGeoJSON(routeId);
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// ── Types ────────────────────────────────────────────────

export interface MapPoint {
  id: string;
  type: "museum" | "location" | "route_stop" | "outdoor_stop" | "story";
  title: string;
  latitude: number;
  longitude: number;
  icon?: string;
  color?: string;
  slug?: string;
  category?: string;
  imageUrl?: string;
  distanceKm?: number;
}

export interface RouteLine {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  path: any; // GeoJSON LineString
}

export interface MapLayersResponse {
  layers: Record<string, MapPoint[]>;
  routeLines: RouteLine[];
  totalPoints: number;
}

export interface NearbyResponse {
  center: { latitude: number; longitude: number };
  radiusKm: number;
  count: number;
  points: MapPoint[];
}

export interface BboxResponse {
  bounds: { north: number; south: number; east: number; west: number };
  count: number;
  points: MapPoint[];
}

export interface RouteGeoJSON {
  type: "FeatureCollection";
  features: any[];
  properties: {
    routeId: string;
    title: string;
    slug: string;
    difficulty: string;
    durationMinutes: number;
    distanceKm: number;
    stopsCount: number;
  };
}

// ── Rwanda defaults ──────────────────────────────────────
export const RWANDA_CENTER = { latitude: -1.9403, longitude: 29.8739 }; // Kigali
export const RWANDA_BOUNDS = {
  north: -1.0,
  south: -2.9,
  east: 30.9,
  west: 28.8,
};

// ── API helpers ──────────────────────────────────────────

const BASE = api.baseURL;

async function postSpatial<T>(endpoint: string, body: any): Promise<T> {
  const res = await fetch(`${BASE}/spatial/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Spatial API error: ${res.status}`);
  return res.json();
}

async function getSpatial<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${BASE}/spatial/${endpoint}`, window.location.origin);
  if (params)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) throw new Error(`Spatial API error: ${res.status}`);
  return res.json();
}

// ── Hooks ────────────────────────────────────────────────

/** Fetch all map layers — museums, locations, stops, route lines */
export function useMapLayers(opts?: {
  center?: { latitude: number; longitude: number };
  radiusKm?: number;
  types?: string[];
  enabled?: boolean;
}) {
  const { center, radiusKm, types, enabled = true } = opts || {};

  return useQuery<MapLayersResponse>({
    queryKey: [
      "map-layers",
      center?.latitude,
      center?.longitude,
      radiusKm,
      types,
    ],
    queryFn: () =>
      postSpatial<MapLayersResponse>("layers", { center, radiusKm, types }),
    enabled,
    staleTime: 60_000, // 1 min cache — map data doesn't change often
    refetchOnWindowFocus: false,
  });
}

/** Fetch points near a location (user position or tap) */
export function useNearby(opts: {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  types?: string[];
  enabled?: boolean;
}) {
  const { latitude, longitude, radiusKm = 5, types, enabled = true } = opts;

  return useQuery<NearbyResponse>({
    queryKey: ["nearby", latitude, longitude, radiusKm, types],
    queryFn: () =>
      postSpatial<NearbyResponse>("nearby", {
        latitude,
        longitude,
        radiusKm,
        types,
      }),
    enabled: enabled && !!latitude && !!longitude,
    staleTime: 30_000,
  });
}

/** Fetch points within map viewport bounds */
export function useBboxPoints(opts: {
  north: number;
  south: number;
  east: number;
  west: number;
  types?: string[];
  enabled?: boolean;
}) {
  const { north, south, east, west, types, enabled = true } = opts;

  return useQuery<BboxResponse>({
    queryKey: ["bbox", north, south, east, west, types],
    queryFn: () =>
      postSpatial<BboxResponse>("bbox", { north, south, east, west, types }),
    enabled: enabled && north !== south && east !== west,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

/** Fetch route as GeoJSON FeatureCollection */
export function useRouteGeoJSON(routeId: string | undefined, enabled = true) {
  return useQuery<RouteGeoJSON>({
    queryKey: ["route-geojson", routeId],
    queryFn: () => getSpatial<RouteGeoJSON>("route", { id: routeId! }),
    enabled: enabled && !!routeId,
    staleTime: 120_000,
  });
}

/** Get user's current position (browser Geolocation API) */
export function useUserLocation() {
  return useQuery<{ latitude: number; longitude: number } | null>({
    queryKey: ["user-location"],
    queryFn: () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10_000 },
        );
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/** All points flattened from layers — convenience for simple maps */
export function useAllMapPoints(opts?: {
  types?: string[];
  enabled?: boolean;
}) {
  const query = useMapLayers(opts);
  const points = query.data ? Object.values(query.data.layers).flat() : [];
  return { ...query, points, routeLines: query.data?.routeLines || [] };
}
