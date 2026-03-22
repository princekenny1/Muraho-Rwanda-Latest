/**
 * useRouteAdmin — Route administration hooks
 *
 * Backend collections:
 *   "routes" — route metadata + relationship to route-stops
 *   "route-stops" — individual stops with embedded contentBlocks[]
 *
 * Field mapping (frontend snake_case → Payload camelCase):
 *   title → name
 *   cover_image → heroImage
 *   stop_order → orderIndex
 *   estimated_time_minutes → estimatedMinutes
 *   autoplay_on_arrival → autoplayOnArrival
 *   marker_color → markerColor
 *   marker_icon → markerIcon
 *   content_blocks → contentBlocks (embedded array)
 *   block_type → blockType
 *   block_order → blockOrder
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  Route,
  RouteStop,
  StopContentBlock,
  ContentBlockType,
  ContentBlockData,
  StopMarkerIcon,
} from "@/types/routes";

// ── Payload response shapes ──────────────────────────────

interface PayloadRoute {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  heroImage?: { id: string; url: string } | string;
  difficulty?: string;
  estimatedHours?: number;
  distanceKm?: number;
  transportMode?: string[];
  accessLevel?: string;
  category?: string;
  sensitivityLevel?: string;
  offlineAvailable?: boolean;
  _status?: string;
  stops?: Array<PayloadRouteStop | string>;
}

interface PayloadContentBlock {
  id: string;
  blockType: string;
  blockOrder: number;
  content: Record<string, unknown>;
}

interface PayloadRouteStop {
  id: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  orderIndex: number;
  estimatedMinutes?: number;
  autoplayOnArrival?: boolean;
  markerColor?: string;
  markerIcon?: string;
  contentBlocks?: PayloadContentBlock[];
  location?: { id: string; coordinates?: { latitude: number; longitude: number } } | string;
}

// ── Mappers ──────────────────────────────────────────────

function mapRoute(doc: PayloadRoute): Route {
  const heroImg =
    typeof doc.heroImage === "object" && doc.heroImage?.url
      ? doc.heroImage.url
      : undefined;

  // Resolve stops if populated
  const stops: RouteStop[] = (doc.stops || [])
    .filter((s): s is PayloadRouteStop => typeof s === "object")
    .map((s) => mapStop(s, doc.id))
    .sort((a, b) => a.stop_order - b.stop_order);

  return {
    id: doc.id,
    title: doc.name,
    slug: doc.slug,
    description: doc.shortDescription,
    cover_image: heroImg,
    duration_minutes: doc.estimatedHours ? Math.round(doc.estimatedHours * 60) : null,
    estimated_hours: doc.estimatedHours,
    difficulty: doc.difficulty as Route["difficulty"],
    distance_km: doc.distanceKm,
    transport_mode: doc.transportMode || null,
    access_level: (doc.accessLevel || "free") as Route["access_level"],
    category: doc.category || null,
    sensitivity_level: doc.sensitivityLevel || null,
    offline_available: doc.offlineAvailable ?? false,
    status: (doc._status || "draft") as Route["status"],
    created_by: null,
    published_at: null,
    stops,
  };
}

function mapStop(doc: PayloadRouteStop, routeId: string): RouteStop {
  // Resolve lat/lng: may be directly on stop or via location relationship
  let lat = doc.latitude ?? 0;
  let lng = doc.longitude ?? 0;
  if (typeof doc.location === "object" && doc.location?.coordinates) {
    lat = doc.location.coordinates.latitude ?? lat;
    lng = doc.location.coordinates.longitude ?? lng;
  }

  const blocks: StopContentBlock[] = (doc.contentBlocks || [])
    .map((b) => ({
      id: b.id,
      stop_id: doc.id,
      block_type: b.blockType as ContentBlockType,
      block_order: b.blockOrder,
      content: b.content as ContentBlockData,
    }))
    .sort((a, b) => a.block_order - b.block_order);

  return {
    id: doc.id,
    route_id: routeId,
    title: doc.name,
    description: doc.description ?? null,
    latitude: lat,
    longitude: lng,
    stop_order: doc.orderIndex,
    estimated_time_minutes: doc.estimatedMinutes ?? 15,
    autoplay_on_arrival: doc.autoplayOnArrival ?? false,
    marker_color: doc.markerColor ?? "#F97316",
    marker_icon: (doc.markerIcon ?? "location") as StopMarkerIcon,
    linked_story_id: typeof (doc as any).linkedStory === "object"
      ? (doc as any).linkedStory?.id
      : (doc as any).linkedStory ?? null,
    linked_testimony_id: typeof (doc as any).linkedTestimony === "object"
      ? (doc as any).linkedTestimony?.id
      : (doc as any).linkedTestimony ?? null,
    content_blocks: blocks,
  };
}

// ── Route Hooks ──────────────────────────────────────────

export function useRoutes() {
  return useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const res = await api.find("routes", { depth: 2, limit: 100, sort: "name" });
      return (res.docs as PayloadRoute[]).map(mapRoute);
    },
  });
}

export function useRoute(routeId?: string) {
  return useQuery({
    queryKey: ["route", routeId],
    queryFn: async () => {
      const doc = (await api.findById("routes", routeId!, { depth: 2 })) as PayloadRoute;
      return mapRoute(doc);
    },
    enabled: !!routeId,
  });
}

export function useRouteMutations() {
  const queryClient = useQueryClient();

  const createRoute = useMutation({
    mutationFn: async (data: {
      title: string;
      slug: string;
      description?: string;
      cover_image?: string;
    }) => {
      const payload: Record<string, unknown> = {
        name: data.title,
        slug: data.slug,
        shortDescription: data.description,
      };
      // If cover_image is a URL from our media, we'd need the media ID.
      // For now pass as-is; the CMS endpoint or a follow-up upload handles this.
      if (data.cover_image) {
        payload.heroImage = data.cover_image;
      }
      return api.create("routes", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const updateRoute = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      slug?: string;
      description?: string;
      cover_image?: string;
    }) => {
      const payload: Record<string, unknown> = {};
      if (data.title !== undefined) payload.name = data.title;
      if (data.slug !== undefined) payload.slug = data.slug;
      if (data.description !== undefined) payload.shortDescription = data.description;
      if (data.cover_image !== undefined) payload.heroImage = data.cover_image;
      return api.update("routes", id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route"] });
    },
  });

  const deleteRoute = useMutation({
    mutationFn: async (id: string) => api.delete("routes", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  return { createRoute, updateRoute, deleteRoute };
}

// ── Route Stop Hooks ─────────────────────────────────────

export function useRouteStops(routeId?: string) {
  return useQuery({
    queryKey: ["route-stops", routeId],
    queryFn: async () => {
      // Fetch route with populated stops
      const doc = (await api.findById("routes", routeId!, { depth: 2 })) as PayloadRoute;
      const stops = (doc.stops || [])
        .filter((s): s is PayloadRouteStop => typeof s === "object")
        .map((s) => mapStop(s, routeId!))
        .sort((a, b) => a.stop_order - b.stop_order);
      return stops;
    },
    enabled: !!routeId,
  });
}

export function useRouteStopMutations() {
  const queryClient = useQueryClient();

  const createStop = useMutation({
    mutationFn: async (data: {
      route_id: string;
      title: string;
      description?: string;
      latitude: number;
      longitude: number;
      stop_order: number;
      estimated_time_minutes?: number;
      autoplay_on_arrival?: boolean;
      marker_color?: string;
      marker_icon?: StopMarkerIcon;
    }) => {
      // 1. Create the route-stop
      const stopDoc = await api.create("route-stops", {
        name: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        orderIndex: data.stop_order,
        estimatedMinutes: data.estimated_time_minutes ?? 15,
        autoplayOnArrival: data.autoplay_on_arrival ?? false,
        markerColor: data.marker_color ?? "#F97316",
        markerIcon: data.marker_icon ?? "location",
      });

      // 2. Add stop to route's stops array
      const route = (await api.findById("routes", data.route_id, { depth: 0 })) as PayloadRoute;
      const existingStopIds = (route.stops || []).map((s) =>
        typeof s === "string" ? s : s.id
      );
      await api.update("routes", data.route_id, {
        stops: [...existingStopIds, stopDoc.id],
      });

      return stopDoc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops"] });
      queryClient.invalidateQueries({ queryKey: ["route"] });
    },
  });

  const updateStop = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string | null;
      latitude?: number;
      longitude?: number;
      stop_order?: number;
      estimated_time_minutes?: number;
      autoplay_on_arrival?: boolean;
      marker_color?: string;
      marker_icon?: StopMarkerIcon;
    }) => {
      const payload: Record<string, unknown> = {};
      if (data.title !== undefined) payload.name = data.title;
      if (data.description !== undefined) payload.description = data.description;
      if (data.latitude !== undefined) payload.latitude = data.latitude;
      if (data.longitude !== undefined) payload.longitude = data.longitude;
      if (data.stop_order !== undefined) payload.orderIndex = data.stop_order;
      if (data.estimated_time_minutes !== undefined) payload.estimatedMinutes = data.estimated_time_minutes;
      if (data.autoplay_on_arrival !== undefined) payload.autoplayOnArrival = data.autoplay_on_arrival;
      if (data.marker_color !== undefined) payload.markerColor = data.marker_color;
      if (data.marker_icon !== undefined) payload.markerIcon = data.marker_icon;
      return api.update("route-stops", id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops"] });
      queryClient.invalidateQueries({ queryKey: ["route"] });
    },
  });

  const deleteStop = useMutation({
    mutationFn: async ({ id, routeId }: { id: string; routeId: string }) => {
      // Remove from route relationship
      const route = (await api.findById("routes", routeId, { depth: 0 })) as PayloadRoute;
      const remaining = (route.stops || [])
        .map((s) => (typeof s === "string" ? s : s.id))
        .filter((sid) => sid !== id);
      await api.update("routes", routeId, { stops: remaining });

      // Delete the stop document
      return api.delete("route-stops", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops"] });
      queryClient.invalidateQueries({ queryKey: ["route"] });
    },
  });

  const reorderStops = useMutation({
    mutationFn: async ({
      routeId,
      stops,
    }: {
      routeId: string;
      stops: RouteStop[];
    }) => {
      // Update orderIndex on each stop and update route relationship order
      const updatePromises = stops.map((s, index) =>
        api.update("route-stops", s.id, { orderIndex: index + 1 })
      );
      await Promise.all(updatePromises);

      // Update route stop ordering
      await api.update("routes", routeId, {
        stops: stops.map((s) => s.id),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops"] });
      queryClient.invalidateQueries({ queryKey: ["route"] });
    },
  });

  const moveStop = useMutation({
    mutationFn: async ({
      id,
      lat,
      lng,
    }: {
      id: string;
      lat: number;
      lng: number;
    }) => {
      return api.update("route-stops", id, {
        latitude: lat,
        longitude: lng,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops"] });
      queryClient.invalidateQueries({ queryKey: ["route"] });
    },
  });

  return { createStop, updateStop, deleteStop, reorderStops, moveStop };
}

// ── Stop Content Blocks ──────────────────────────────────
// Content blocks are embedded arrays inside route-stops

export function useStopContentBlocks(stopId: string) {
  const queryClient = useQueryClient();

  const { data: blocks = [], isLoading: loading } = useQuery({
    queryKey: ["stop-content-blocks", stopId],
    queryFn: async () => {
      const doc = (await api.findById("route-stops", stopId, { depth: 0 })) as PayloadRouteStop;
      return (doc.contentBlocks || [])
        .map((b) => ({
          id: b.id,
          stop_id: stopId,
          block_type: b.blockType as ContentBlockType,
          block_order: b.blockOrder,
          content: b.content as ContentBlockData,
        }))
        .sort((a, b) => a.block_order - b.block_order);
    },
    enabled: !!stopId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["stop-content-blocks", stopId] });
    queryClient.invalidateQueries({ queryKey: ["route-stops"] });
  };

  const createBlock = async (type: ContentBlockType, content: ContentBlockData) => {
    const doc = (await api.findById("route-stops", stopId, { depth: 0 })) as PayloadRouteStop;
    const existing = doc.contentBlocks || [];
    const newBlock: PayloadContentBlock = {
      id: crypto.randomUUID(),
      blockType: type,
      blockOrder: existing.length + 1,
      content: content as Record<string, unknown>,
    };
    await api.update("route-stops", stopId, {
      contentBlocks: [...existing, newBlock],
    });
    invalidate();
  };

  const updateBlock = async (blockId: string, content: ContentBlockData) => {
    const doc = (await api.findById("route-stops", stopId, { depth: 0 })) as PayloadRouteStop;
    const updated = (doc.contentBlocks || []).map((b) =>
      b.id === blockId ? { ...b, content: content as Record<string, unknown> } : b
    );
    await api.update("route-stops", stopId, { contentBlocks: updated });
    invalidate();
  };

  const deleteBlock = async (blockId: string) => {
    const doc = (await api.findById("route-stops", stopId, { depth: 0 })) as PayloadRouteStop;
    const filtered = (doc.contentBlocks || []).filter((b) => b.id !== blockId);
    // Re-index blockOrder
    const reindexed = filtered.map((b, i) => ({ ...b, blockOrder: i + 1 }));
    await api.update("route-stops", stopId, { contentBlocks: reindexed });
    invalidate();
  };

  const reorderBlocks = async (reordered: StopContentBlock[]) => {
    const payloadBlocks: PayloadContentBlock[] = reordered.map((b, i) => ({
      id: b.id,
      blockType: b.block_type,
      blockOrder: i + 1,
      content: b.content as Record<string, unknown>,
    }));
    await api.update("route-stops", stopId, { contentBlocks: payloadBlocks });
    invalidate();
  };

  return { blocks, loading, createBlock, updateBlock, deleteBlock, reorderBlocks };
}

// ══════════════════════════════════════════════════════════════════════════════
// UNIFIED useRouteAdmin() — the hook RouteAdmin + RouteBuilder expect
// ══════════════════════════════════════════════════════════════════════════════
// Returns: { routes, loading, createRoute, updateRoute, deleteRoute, publishRoute, unpublishRoute }

import { useCallback } from "react";

export function useRouteAdmin() {
  const { data: routes = [], isLoading: loading } = useRoutes();
  const { createRoute: createMut, updateRoute: updateMut, deleteRoute: deleteMut } = useRouteMutations();
  const queryClient = useQueryClient();

  const createRoute = useCallback(
    async (data: { title: string; slug: string; description?: string; cover_image?: string }) => {
      return createMut.mutateAsync(data);
    },
    [createMut]
  );

  const updateRoute = useCallback(
    async (data: { id: string; title?: string; description?: string; cover_image?: string }) => {
      return updateMut.mutateAsync(data);
    },
    [updateMut]
  );

  const deleteRoute = useCallback(
    async (id: string) => {
      return deleteMut.mutateAsync(id);
    },
    [deleteMut]
  );

  const publishRoute = useCallback(
    async (id: string) => {
      await api.update("routes", id, {
        status: "published",
        publishedAt: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route", id] });
    },
    [queryClient]
  );

  const unpublishRoute = useCallback(
    async (id: string) => {
      await api.update("routes", id, {
        status: "draft",
        publishedAt: null,
      });
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route", id] });
    },
    [queryClient]
  );

  return {
    routes,
    loading,
    createRoute,
    updateRoute,
    deleteRoute,
    publishRoute,
    unpublishRoute,
  };
}
