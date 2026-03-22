/**
 * useVRAdmin — VR tour mutation hook
 * ===================================
 * Replaces: Legacy queries
 * Backend: Payload CMS /api/vr-scenes, /api/media
 *
 * Used by: VRAdminPanel, VRHotspotManager, VRBulkActions
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useVRAdmin(museumId: string) {
  const queryClient = useQueryClient();

  const resolveMuseumId = async () => {
    const bySlug = await api.find("museums", {
      where: { slug: { equals: museumId } },
      limit: 1,
      depth: 0,
    });
    if (bySlug.docs.length > 0) {
      return (bySlug.docs[0] as any).id as string;
    }
    return museumId;
  };

  // ── Scene CRUD ──────────────────────────────────────

  const createScene = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const resolvedMuseumId = await resolveMuseumId();

      const existingScenes = await api.find("vr-scenes", {
        where: { museum: { equals: resolvedMuseumId } },
        sort: "-sceneOrder",
        limit: 1,
        depth: 0,
      });

      const maxOrder =
        existingScenes.docs.length > 0
          ? Number((existingScenes.docs[0] as any).sceneOrder || 0)
          : 0;

      return api.create("vr-scenes", {
        museum: resolvedMuseumId,
        title: data.title,
        description: data.description || null,
        panoramaUrl: data.panorama_url,
        sceneOrder: data.scene_order || maxOrder + 1,
        narrationText: data.narration_text || null,
        narrationAudioUrl: data.narration_audio_url || null,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vr-scenes"] });
    },
  });

  const updateScene = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & Record<string, any>) => {
      const payload: Record<string, any> = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.description !== undefined)
        payload.description = data.description;
      if (data.panorama_url !== undefined)
        payload.panoramaUrl = data.panorama_url;
      if (data.scene_order !== undefined) payload.sceneOrder = data.scene_order;
      if (data.narration_text !== undefined)
        payload.narrationText = data.narration_text;
      if (data.narration_audio_url !== undefined)
        payload.narrationAudioUrl = data.narration_audio_url;
      if (data.is_active !== undefined) payload.isActive = data.is_active;

      return api.update("vr-scenes", id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vr-scenes"] });
    },
  });

  const deleteScene = useMutation({
    mutationFn: async (sceneId: string) => {
      return api.delete("vr-scenes", sceneId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vr-scenes"] });
    },
  });

  const reorderScenes = useMutation({
    mutationFn: async (updates: { id: string; scene_order: number }[]) => {
      await Promise.all(
        updates.map(({ id, scene_order }) =>
          api.update("vr-scenes", id, { sceneOrder: scene_order }),
        ),
      );
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vr-scenes"] });
    },
  });

  // ── Hotspot CRUD ────────────────────────────────────

  const createHotspot = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return api.create("vr-hotspots", {
        scene: data.scene_id,
        type: data.type,
        title: data.title,
        description: data.description || null,
        positionX: data.position_x,
        positionY: data.position_y,
        targetScene: data.target_scene_id || null,
        content: data.content || null,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vr-hotspots"] });
      queryClient.invalidateQueries({ queryKey: ["vr-scenes"] });
    },
  });

  const updateHotspot = useMutation({
    mutationFn: async ({
      id,
      scene_id,
      ...data
    }: { id: string; scene_id: string } & Record<string, any>) => {
      const payload: Record<string, any> = {};
      if (scene_id !== undefined) payload.scene = scene_id;
      if (data.type !== undefined) payload.type = data.type;
      if (data.title !== undefined) payload.title = data.title;
      if (data.description !== undefined)
        payload.description = data.description;
      if (data.position_x !== undefined) payload.positionX = data.position_x;
      if (data.position_y !== undefined) payload.positionY = data.position_y;
      if (data.target_scene_id !== undefined)
        payload.targetScene = data.target_scene_id;
      if (data.content !== undefined) payload.content = data.content;

      return api.update("vr-hotspots", id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vr-hotspots"] });
    },
  });

  const deleteHotspot = useMutation({
    mutationFn: async ({
      hotspotId,
      sceneId,
    }: {
      hotspotId: string;
      sceneId: string;
    }) => {
      void sceneId;
      return api.delete("vr-hotspots", hotspotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vr-hotspots"] });
    },
  });

  // ── Media upload (replaces legacy query) ────────

  const uploadPanorama = useMutation({
    mutationFn: async (file: File) => {
      const result = await api.uploadMedia(file, file.name);
      return result;
    },
  });

  return {
    createScene,
    updateScene,
    deleteScene,
    reorderScenes,
    createHotspot,
    updateHotspot,
    deleteHotspot,
    uploadPanorama,
  };
}
