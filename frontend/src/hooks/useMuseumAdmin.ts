/**
 * useMuseumAdmin — Museum content management hooks
 *
 * Replaces: Legacy
 *   - museums
 *   - museum_rooms
 *   - museum_panels
 *   - museum_panel_blocks
 *   - museum_outdoor_stops
 *
 * Backend: Payload CMS collection "museums" with embedded structure:
 *   museums → rooms[] → panels[] → blocks[]
 *   museums → outdoorStops[]
 *
 * The Payload "museums" collection stores rooms, panels, blocks, and
 * outdoor stops as embedded arrays. This hook provides a relational-style
 * API on top of embedded documents so components don't need to change.
 *
 * Used by: MuseumRoomsTab, MuseumPanelsTab, MuseumOutdoorTab,
 *          MuseumSettingsTab, MuseumPreviewTab, OutdoorStopMap,
 *          BulkExhibitionImporter
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// ─── Types ───────────────────────────────────────────────────────────

export interface Museum {
  id: string;
  name: string;
  slug: string;
  address?: string;
  description?: string;
  short_description?: string;
  cover_image?: string;
  latitude?: number;
  longitude?: number;
  indoor_flow: "linear" | "free_explore" | "guided";
  show_outdoor_map: boolean;
  outdoor_pins_visibility: "always" | "nearby";
  hide_graphic_in_kid_mode: boolean;
  replace_raw_testimonies: boolean;
  history_summary?: string;
  mission?: string;
  visitor_guidance?: string;
  safety_notice?: string;
  etiquette?: string;
  opening_hours?: Record<string, any>;
  contact_info?: Record<string, any>;
  is_active: boolean;
  is_featured: boolean;
}

export interface MuseumRoom {
  id: string;
  museum_id: string;
  name: string;
  room_type: "indoor" | "audio_tour" | "timeline";
  room_order: number;
  introduction?: string;
}

export interface MuseumPanel {
  id: string;
  room_id: string;
  title: string;
  panel_number?: string;
  panel_order: number;
  notes?: string;
  auto_resize: boolean;
  allow_swipe_gallery: boolean;
  text_flow_optimization: boolean;
}

export interface MuseumPanelBlock {
  id: string;
  panel_id: string;
  block_type: string;
  block_order: number;
  content: Record<string, unknown>;
}

export interface MuseumOutdoorStop {
  id: string;
  museum_id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  stop_order: number;
  estimated_time_minutes?: number;
  autoplay_on_arrival?: boolean;
  marker_color?: string;
}

// ─── Payload raw types ───────────────────────────────────────────────

interface PayloadMuseum {
  id: string;
  name: string;
  slug: string;
  address?: string;
  shortDescription?: string;
  coverImage?: { url: string } | null;
  location?: { coordinates: [number, number] } | null;
  latitude?: number;
  longitude?: number;
  indoorFlow: string;
  showOutdoorMap: boolean;
  outdoorPinsVisibility: string;
  hideGraphicInKidMode: boolean;
  replaceRawTestimonies: boolean;
  safetyNotice?: string;
  visitorGuidance?: string;
  isActive: boolean;
  isFeatured: boolean;
  rooms?: PayloadRoom[];
  outdoorStops?: PayloadOutdoorStop[];
}

interface PayloadRoom {
  id: string;
  name: string;
  roomType: string;
  roomOrder: number;
  introduction?: string;
  panels?: PayloadPanel[];
}

interface PayloadPanel {
  id: string;
  title: string;
  panelNumber?: string;
  panelOrder: number;
  notes?: string;
  autoResize: boolean;
  allowSwipeGallery: boolean;
  textFlowOptimization: boolean;
  blocks?: PayloadBlock[];
}

interface PayloadBlock {
  id: string;
  blockType: string;
  blockOrder: number;
  content: Record<string, unknown>;
}

interface PayloadOutdoorStop {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  estimatedTimeMinutes?: number;
  autoplayOnArrival?: boolean;
  markerColor?: string;
}

// ─── Mappers ─────────────────────────────────────────────────────────

function mapMuseum(raw: PayloadMuseum): Museum {
  // Latitude/longitude may come from a GeoJSON point or flat fields
  const lat = raw.latitude ?? raw.location?.coordinates?.[1];
  const lng = raw.longitude ?? raw.location?.coordinates?.[0];

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    address: raw.address,
    short_description: raw.shortDescription,
    cover_image: raw.coverImage?.url,
    latitude: lat,
    longitude: lng,
    indoor_flow: raw.indoorFlow as Museum["indoor_flow"],
    show_outdoor_map: raw.showOutdoorMap,
    outdoor_pins_visibility: raw.outdoorPinsVisibility as Museum["outdoor_pins_visibility"],
    hide_graphic_in_kid_mode: raw.hideGraphicInKidMode,
    replace_raw_testimonies: raw.replaceRawTestimonies,
    description: (raw as any).description,
    history_summary: (raw as any).historySummary,
    mission: (raw as any).mission,
    visitor_guidance: raw.visitorGuidance,
    safety_notice: raw.safetyNotice,
    etiquette: (raw as any).etiquette,
    opening_hours: (raw as any).openingHours,
    contact_info: (raw as any).contactInfo,
    is_active: raw.isActive,
    is_featured: raw.isFeatured,
  };
}

function mapRoom(raw: PayloadRoom, museumId: string): MuseumRoom {
  return {
    id: raw.id,
    museum_id: museumId,
    name: raw.name,
    room_type: raw.roomType as MuseumRoom["room_type"],
    room_order: raw.roomOrder,
    introduction: raw.introduction,
  };
}

function mapPanel(raw: PayloadPanel, roomId: string): MuseumPanel {
  return {
    id: raw.id,
    room_id: roomId,
    title: raw.title,
    panel_number: raw.panelNumber,
    panel_order: raw.panelOrder,
    notes: raw.notes,
    auto_resize: raw.autoResize,
    allow_swipe_gallery: raw.allowSwipeGallery,
    text_flow_optimization: raw.textFlowOptimization,
  };
}

function mapBlock(raw: PayloadBlock, panelId: string): MuseumPanelBlock {
  return {
    id: raw.id,
    panel_id: panelId,
    block_type: raw.blockType,
    block_order: raw.blockOrder,
    content: raw.content,
  };
}

function mapOutdoorStop(
  raw: PayloadOutdoorStop,
  museumId: string
): MuseumOutdoorStop {
  return {
    id: raw.id,
    museum_id: museumId,
    title: raw.title,
    description: raw.description,
    latitude: raw.latitude,
    longitude: raw.longitude,
    stop_order: raw.stopOrder,
    estimated_time_minutes: raw.estimatedTimeMinutes,
    autoplay_on_arrival: raw.autoplayOnArrival,
    marker_color: raw.markerColor,
  };
}

// ─── Helper: fetch full museum at depth ──────────────────────────────

async function fetchMuseum(
  museumId: string,
  depth = 2
): Promise<PayloadMuseum> {
  return api.findById("museums", museumId, { depth });
}

// ─── Museum queries ──────────────────────────────────────────────────

export function useMuseums() {
  return useQuery({
    queryKey: ["museums"],
    queryFn: async () => {
      const res = await api.find("museums", { sort: "name", limit: 200 });
      return (res.docs as PayloadMuseum[]).map(mapMuseum);
    },
  });
}

export function useMuseum(museumId?: string) {
  return useQuery({
    queryKey: ["museum", museumId],
    queryFn: async () => {
      const doc = await fetchMuseum(museumId!);
      return mapMuseum(doc);
    },
    enabled: !!museumId,
  });
}

// ─── Museum CRUD ─────────────────────────────────────────────────────

export function useMuseumMutations() {
  const queryClient = useQueryClient();

  const updateMuseum = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<Museum>) => {
      const p: Record<string, unknown> = {};
      if (updates.name !== undefined) p.name = updates.name;
      if (updates.indoor_flow !== undefined) p.indoorFlow = updates.indoor_flow;
      if (updates.show_outdoor_map !== undefined)
        p.showOutdoorMap = updates.show_outdoor_map;
      if (updates.outdoor_pins_visibility !== undefined)
        p.outdoorPinsVisibility = updates.outdoor_pins_visibility;
      if (updates.hide_graphic_in_kid_mode !== undefined)
        p.hideGraphicInKidMode = updates.hide_graphic_in_kid_mode;
      if (updates.replace_raw_testimonies !== undefined)
        p.replaceRawTestimonies = updates.replace_raw_testimonies;
      if (updates.safety_notice !== undefined)
        p.safetyNotice = updates.safety_notice;
      if (updates.visitor_guidance !== undefined)
        p.visitorGuidance = updates.visitor_guidance;
      if (updates.is_active !== undefined) p.isActive = updates.is_active;
      if (updates.is_featured !== undefined) p.isFeatured = updates.is_featured;
      if (updates.description !== undefined) p.description = updates.description;
      if (updates.short_description !== undefined) p.shortDescription = updates.short_description;
      if (updates.history_summary !== undefined) p.historySummary = updates.history_summary;
      if (updates.mission !== undefined) p.mission = updates.mission;
      if (updates.etiquette !== undefined) p.etiquette = updates.etiquette;
      if (updates.address !== undefined) p.address = updates.address;
      if (updates.opening_hours !== undefined) p.openingHours = updates.opening_hours;
      if (updates.contact_info !== undefined) p.contactInfo = updates.contact_info;
      if (updates.latitude !== undefined) p.latitude = updates.latitude;
      if (updates.longitude !== undefined) p.longitude = updates.longitude;

      return api.update("museums", id, p);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum"] });
      queryClient.invalidateQueries({ queryKey: ["museums"] });
    },
  });

  const createMuseum = useMutation({
    mutationFn: async (data: {
      name: string;
      slug: string;
      short_description?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      return api.create("museums", {
        name: data.name,
        slug: data.slug,
        shortDescription: data.short_description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        isActive: true,
        isFeatured: false,
        indoorFlow: "linear",
        showOutdoorMap: true,
        hideGraphicInKidMode: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museums"] });
    },
  });

  const deleteMuseum = useMutation({
    mutationFn: async (id: string) => {
      return api.delete("museums", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museums"] });
    },
  });

  return { createMuseum, updateMuseum, deleteMuseum };
}

// ─── Rooms ───────────────────────────────────────────────────────────

export function useMuseumRooms(museumId?: string) {
  return useQuery({
    queryKey: ["museum-rooms", museumId],
    queryFn: async () => {
      if (!museumId) return [];
      const museum = await fetchMuseum(museumId, 1);
      return (museum.rooms || [])
        .map((r) => mapRoom(r, museumId))
        .sort((a, b) => a.room_order - b.room_order);
    },
    enabled: !!museumId,
  });
}

export function useRoomMutations() {
  const queryClient = useQueryClient();

  const createRoom = useMutation({
    mutationFn: async (data: {
      museum_id: string;
      name: string;
      room_type: string;
      room_order: number;
      introduction?: string;
    }) => {
      const museum = await fetchMuseum(data.museum_id, 1);
      const rooms = museum.rooms || [];
      rooms.push({
        id: crypto.randomUUID(),
        name: data.name,
        roomType: data.room_type,
        roomOrder: data.room_order,
        introduction: data.introduction,
        panels: [],
      });
      return api.update("museums", data.museum_id, { rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-rooms"] });
    },
  });

  const updateRoom = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<MuseumRoom>) => {
      // Find which museum contains this room
      const res = await api.find("museums", { depth: 1, limit: 50 });
      const allMuseums = res.docs as PayloadMuseum[];
      const museum = allMuseums.find((m) =>
        m.rooms?.some((r) => r.id === id)
      );
      if (!museum) throw new Error("Room not found");

      const rooms = (museum.rooms || []).map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.room_type !== undefined && { roomType: updates.room_type }),
          ...(updates.introduction !== undefined && {
            introduction: updates.introduction,
          }),
        };
      });
      return api.update("museums", museum.id, { rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-rooms"] });
    },
  });

  const deleteRoom = useMutation({
    mutationFn: async ({
      id,
      museumId,
    }: {
      id: string;
      museumId: string;
    }) => {
      const museum = await fetchMuseum(museumId, 1);
      const rooms = (museum.rooms || []).filter((r) => r.id !== id);
      return api.update("museums", museumId, { rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["museum-panels"] });
    },
  });

  return { createRoom, updateRoom, deleteRoom };
}

// ─── Panels ──────────────────────────────────────────────────────────

export function useMuseumPanels(roomId?: string) {
  return useQuery({
    queryKey: ["museum-panels", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      // Search all museums for this room
      const res = await api.find("museums", { depth: 2, limit: 50 });
      const allMuseums = res.docs as PayloadMuseum[];

      for (const museum of allMuseums) {
        const room = museum.rooms?.find((r) => r.id === roomId);
        if (room) {
          return (room.panels || [])
            .map((p) => mapPanel(p, roomId))
            .sort((a, b) => a.panel_order - b.panel_order);
        }
      }
      return [];
    },
    enabled: !!roomId,
  });
}

export function usePanelMutations() {
  const queryClient = useQueryClient();

  // Helper: find museum + room containing a room or panel
  async function findMuseumWithRoom(roomId: string) {
    const res = await api.find("museums", { depth: 2, limit: 50 });
    const allMuseums = res.docs as PayloadMuseum[];
    for (const museum of allMuseums) {
      const roomIdx = museum.rooms?.findIndex((r) => r.id === roomId);
      if (roomIdx !== undefined && roomIdx >= 0) {
        return { museum, roomIdx };
      }
    }
    throw new Error("Room not found in any museum");
  }

  const createPanel = useMutation({
    mutationFn: async (data: {
      room_id: string;
      title: string;
      panel_number?: string;
      panel_order: number;
      notes?: string;
      auto_resize?: boolean;
      allow_swipe_gallery?: boolean;
      text_flow_optimization?: boolean;
    }) => {
      const { museum, roomIdx } = await findMuseumWithRoom(data.room_id);
      const rooms = [...(museum.rooms || [])];
      const room = { ...rooms[roomIdx] };
      const panels = [...(room.panels || [])];

      panels.push({
        id: crypto.randomUUID(),
        title: data.title,
        panelNumber: data.panel_number,
        panelOrder: data.panel_order,
        notes: data.notes,
        autoResize: data.auto_resize ?? true,
        allowSwipeGallery: data.allow_swipe_gallery ?? true,
        textFlowOptimization: data.text_flow_optimization ?? true,
        blocks: [],
      });

      room.panels = panels;
      rooms[roomIdx] = room;
      return api.update("museums", museum.id, { rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-panels"] });
    },
  });

  const updatePanel = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<MuseumPanel>) => {
      const res = await api.find("museums", { depth: 2, limit: 50 });
      const allMuseums = res.docs as PayloadMuseum[];

      for (const museum of allMuseums) {
        const rooms = museum.rooms || [];
        for (let ri = 0; ri < rooms.length; ri++) {
          const panels = rooms[ri].panels || [];
          const pi = panels.findIndex((p) => p.id === id);
          if (pi >= 0) {
            const updatedRooms = [...rooms];
            const updatedPanels = [...panels];
            updatedPanels[pi] = {
              ...updatedPanels[pi],
              ...(updates.title !== undefined && { title: updates.title }),
              ...(updates.panel_number !== undefined && {
                panelNumber: updates.panel_number,
              }),
              ...(updates.notes !== undefined && { notes: updates.notes }),
              ...(updates.auto_resize !== undefined && {
                autoResize: updates.auto_resize,
              }),
              ...(updates.allow_swipe_gallery !== undefined && {
                allowSwipeGallery: updates.allow_swipe_gallery,
              }),
              ...(updates.text_flow_optimization !== undefined && {
                textFlowOptimization: updates.text_flow_optimization,
              }),
            };
            updatedRooms[ri] = { ...updatedRooms[ri], panels: updatedPanels };
            return api.update("museums", museum.id, { rooms: updatedRooms });
          }
        }
      }
      throw new Error("Panel not found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-panels"] });
    },
  });

  const deletePanel = useMutation({
    mutationFn: async ({
      id,
      roomId,
    }: {
      id: string;
      roomId: string;
    }) => {
      const { museum, roomIdx } = await findMuseumWithRoom(roomId);
      const rooms = [...(museum.rooms || [])];
      const room = { ...rooms[roomIdx] };
      room.panels = (room.panels || []).filter((p) => p.id !== id);
      rooms[roomIdx] = room;
      return api.update("museums", museum.id, { rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-panels"] });
      queryClient.invalidateQueries({ queryKey: ["museum-panel-blocks"] });
    },
  });

  return { createPanel, updatePanel, deletePanel };
}

// ─── Panel Blocks ────────────────────────────────────────────────────

export function useMuseumPanelBlocks(panelId?: string) {
  return useQuery({
    queryKey: ["museum-panel-blocks", panelId],
    queryFn: async () => {
      if (!panelId) return [];
      const res = await api.find("museums", { depth: 3, limit: 50 });
      const allMuseums = res.docs as PayloadMuseum[];

      for (const museum of allMuseums) {
        for (const room of museum.rooms || []) {
          const panel = (room.panels || []).find((p) => p.id === panelId);
          if (panel) {
            return (panel.blocks || [])
              .map((b) => mapBlock(b, panelId))
              .sort((a, b) => a.block_order - b.block_order);
          }
        }
      }
      return [];
    },
    enabled: !!panelId,
  });
}

export function usePanelBlockMutations() {
  const queryClient = useQueryClient();

  // Helper: find museum + room + panel containing a given panelId
  async function findMuseumWithPanel(panelId: string) {
    const res = await api.find("museums", { depth: 3, limit: 50 });
    const allMuseums = res.docs as PayloadMuseum[];
    for (const museum of allMuseums) {
      const rooms = museum.rooms || [];
      for (let ri = 0; ri < rooms.length; ri++) {
        const panels = rooms[ri].panels || [];
        const pi = panels.findIndex((p) => p.id === panelId);
        if (pi >= 0) {
          return { museum, roomIdx: ri, panelIdx: pi };
        }
      }
    }
    throw new Error("Panel not found in any museum");
  }

  const createBlock = useMutation({
    mutationFn: async (data: {
      panel_id: string;
      block_type: string;
      block_order: number;
      content: Record<string, unknown>;
    }) => {
      const { museum, roomIdx, panelIdx } = await findMuseumWithPanel(data.panel_id);
      const rooms = JSON.parse(JSON.stringify(museum.rooms || []));
      const blocks = rooms[roomIdx].panels[panelIdx].blocks || [];

      blocks.push({
        id: crypto.randomUUID(),
        blockType: data.block_type,
        blockOrder: data.block_order,
        content: data.content,
      });

      rooms[roomIdx].panels[panelIdx].blocks = blocks;
      return api.update("museums", museum.id, { rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-panel-blocks"] });
    },
  });

  const updateBlock = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string; content?: Record<string, unknown>; block_type?: string }) => {
      const res = await api.find("museums", { depth: 3, limit: 50 });
      const allMuseums = res.docs as PayloadMuseum[];

      for (const museum of allMuseums) {
        const rooms = JSON.parse(JSON.stringify(museum.rooms || []));
        for (let ri = 0; ri < rooms.length; ri++) {
          for (let pi = 0; pi < (rooms[ri].panels || []).length; pi++) {
            const blocks = rooms[ri].panels[pi].blocks || [];
            const bi = blocks.findIndex((b: PayloadBlock) => b.id === id);
            if (bi >= 0) {
              if (updates.content !== undefined) blocks[bi].content = updates.content;
              if (updates.block_type !== undefined) blocks[bi].blockType = updates.block_type;
              rooms[ri].panels[pi].blocks = blocks;
              return api.update("museums", museum.id, { rooms });
            }
          }
        }
      }
      throw new Error("Block not found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-panel-blocks"] });
    },
  });

  const deleteBlock = useMutation({
    mutationFn: async ({ id, panelId }: { id: string; panelId: string }) => {
      const { museum, roomIdx, panelIdx } = await findMuseumWithPanel(panelId);
      const rooms = JSON.parse(JSON.stringify(museum.rooms || []));
      rooms[roomIdx].panels[panelIdx].blocks = (
        rooms[roomIdx].panels[panelIdx].blocks || []
      ).filter((b: PayloadBlock) => b.id !== id);
      return api.update("museums", museum.id, { rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-panel-blocks"] });
    },
  });

  const reorderBlocks = useMutation({
    mutationFn: async ({
      blocks: updates,
      panelId,
    }: {
      blocks: Array<{ id: string; block_order: number }>;
      panelId: string;
    }) => {
      const { museum, roomIdx, panelIdx } = await findMuseumWithPanel(panelId);
      const rooms = JSON.parse(JSON.stringify(museum.rooms || []));
      const blocks = rooms[roomIdx].panels[panelIdx].blocks || [];

      // Apply new ordering
      const orderMap = new Map(updates.map((u) => [u.id, u.block_order]));
      for (const block of blocks) {
        const newOrder = orderMap.get(block.id);
        if (newOrder !== undefined) block.blockOrder = newOrder;
      }
      blocks.sort((a: PayloadBlock, b: PayloadBlock) => a.blockOrder - b.blockOrder);

      rooms[roomIdx].panels[panelIdx].blocks = blocks;
      return api.update("museums", museum.id, { rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-panel-blocks"] });
    },
  });

  return { createBlock, updateBlock, deleteBlock, reorderBlocks };
}

// ─── Outdoor Stops ───────────────────────────────────────────────────

export function useMuseumOutdoorStops(museumId?: string) {
  return useQuery({
    queryKey: ["museum-outdoor-stops", museumId],
    queryFn: async () => {
      if (!museumId) return [];
      const museum = await fetchMuseum(museumId, 1);
      return (museum.outdoorStops || [])
        .map((s) => mapOutdoorStop(s, museumId))
        .sort((a, b) => a.stop_order - b.stop_order);
    },
    enabled: !!museumId,
  });
}

export function useOutdoorStopMutations() {
  const queryClient = useQueryClient();

  const createStop = useMutation({
    mutationFn: async (
      data: Omit<MuseumOutdoorStop, "id"> & { museum_id: string }
    ) => {
      const museum = await fetchMuseum(data.museum_id, 1);
      const stops = museum.outdoorStops || [];
      stops.push({
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        stopOrder: data.stop_order,
        estimatedTimeMinutes: data.estimated_time_minutes,
        autoplayOnArrival: data.autoplay_on_arrival,
        markerColor: data.marker_color,
      });
      return api.update("museums", data.museum_id, { outdoorStops: stops });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-outdoor-stops"] });
    },
  });

  const updateStop = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<MuseumOutdoorStop>) => {
      const res = await api.find("museums", { depth: 1, limit: 50 });
      const allMuseums = res.docs as PayloadMuseum[];
      const museum = allMuseums.find((m) =>
        m.outdoorStops?.some((s) => s.id === id)
      );
      if (!museum) throw new Error("Outdoor stop not found");

      const stops = (museum.outdoorStops || []).map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.description !== undefined && {
            description: updates.description,
          }),
          ...(updates.latitude !== undefined && { latitude: updates.latitude }),
          ...(updates.longitude !== undefined && {
            longitude: updates.longitude,
          }),
          ...(updates.estimated_time_minutes !== undefined && {
            estimatedTimeMinutes: updates.estimated_time_minutes,
          }),
          ...(updates.autoplay_on_arrival !== undefined && {
            autoplayOnArrival: updates.autoplay_on_arrival,
          }),
          ...(updates.marker_color !== undefined && {
            markerColor: updates.marker_color,
          }),
        };
      });
      return api.update("museums", museum.id, { outdoorStops: stops });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-outdoor-stops"] });
    },
  });

  const deleteStop = useMutation({
    mutationFn: async ({
      id,
      museumId,
    }: {
      id: string;
      museumId: string;
    }) => {
      const museum = await fetchMuseum(museumId, 1);
      const stops = (museum.outdoorStops || []).filter((s) => s.id !== id);
      return api.update("museums", museumId, { outdoorStops: stops });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["museum-outdoor-stops"] });
    },
  });

  return { createStop, updateStop, deleteStop };
}
