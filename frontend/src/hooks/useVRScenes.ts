/**
 * useVRScenes + useVRHotspots — VR tour data hooks
 * =================================================
 * Replaces: Legacy queries
 * Backend: Payload CMS /api/vr-scenes (scenes as embedded array in panoramas)
 *
 * Exports: VRScene, VRHotspot types, useVRScenes(), useVRHotspots()
 * Used by: VRAdminPanel, VRSceneCard, VRSceneForm, VRHotspotManager, VRHotspotForm,
 *          VRBulkActions, PanoramaUploader, PanoramaPositionPicker
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// ── Types ─────────────────────────────────────────────

export interface VRScene {
  id: string;
  museum_id: string;
  title: string;
  description: string | null;
  panorama_url: string;
  scene_order: number;
  narration_text: string | null;
  narration_audio_url: string | null;
  is_active: boolean;
  createdAt: string;
}

export interface VRHotspot {
  id: string;
  scene_id: string;
  type: "info" | "audio" | "video" | "next-scene" | "landmark";
  title: string;
  description: string | null;
  position_x: number;
  position_y: number;
  content: Record<string, unknown> | null;
  target_scene_id: string | null;
  is_active: boolean;
}

// ── Query Hooks ───────────────────────────────────────

/**
 * Fetch all VR scenes for a museum's virtual tour
 * In Payload, scenes are stored as panoramas[] within virtual-tours collection
 */
export function useVRScenes(museumId?: string, includeInactive = false) {
  return useQuery<VRScene[]>({
    queryKey: ["vr-scenes", museumId, includeInactive],
    queryFn: async () => {
      if (!museumId) return [];

      const resolvedMuseumId = await resolveMuseumId(museumId);

      const result = await api.find("vr-scenes", {
        where: { museum: { equals: resolvedMuseumId } },
        sort: "sceneOrder",
        limit: 200,
        depth: 1,
      });

      return (result.docs as any[])
        .map((doc, index) => mapScene(doc, resolvedMuseumId, index))
        .filter((scene) => includeInactive || scene.is_active)
        .sort((a, b) => a.scene_order - b.scene_order);
    },
    enabled: !!museumId,
  });
}

/**
 * Fetch hotspots for a specific VR scene
 * In Payload, hotspots are embedded within each panorama object
 */
export function useVRHotspots(sceneId?: string) {
  return useQuery<VRHotspot[]>({
    queryKey: ["vr-hotspots", sceneId],
    queryFn: async () => {
      if (!sceneId) return [];

      const result = await api.find("vr-hotspots", {
        where: { scene: { equals: sceneId } },
        sort: "createdAt",
        limit: 500,
        depth: 1,
      });

      return (result.docs as any[]).map((doc, index) =>
        mapHotspot(doc, sceneId, index),
      );
    },
    enabled: !!sceneId,
  });
}

async function resolveMuseumId(museumIdOrSlug: string): Promise<string> {
  const museumBySlug = await api.find("museums", {
    where: { slug: { equals: museumIdOrSlug } },
    limit: 1,
    depth: 0,
  });

  if (museumBySlug.docs.length > 0) {
    return (museumBySlug.docs[0] as any).id;
  }

  return museumIdOrSlug;
}

// ── Field mappers ─────────────────────────────────────

function mapScene(p: any, museumId: string, index: number): VRScene {
  return {
    id: p.id || `scene-${index}`,
    museum_id: museumId,
    title: p.title || `Scene ${index + 1}`,
    description: p.description || null,
    panorama_url: p.panoramaUrl || p.panorama_url || p.panoramaImage?.url || "",
    scene_order: p.sceneOrder || p.scene_order || index + 1,
    narration_text: p.narrationText || p.narration_text || null,
    narration_audio_url: p.narrationAudioUrl || p.narration_audio_url || null,
    is_active: p.isActive ?? p.is_active ?? true,
    createdAt: p.createdAt || new Date().toISOString(),
  };
}

function mapHotspot(h: any, sceneId: string, index: number): VRHotspot {
  return {
    id: h.id || `hotspot-${index}`,
    scene_id: h.scene?.id || h.scene || sceneId,
    type: h.type || "info",
    title: h.title || `Hotspot ${index + 1}`,
    description: h.description || null,
    position_x: h.positionX ?? h.position_x ?? 50,
    position_y: h.positionY ?? h.position_y ?? 50,
    content: h.content || null,
    target_scene_id:
      h.targetScene?.id || h.targetScene || h.target_scene_id || null,
    is_active: h.isActive ?? h.is_active ?? true,
  };
}
