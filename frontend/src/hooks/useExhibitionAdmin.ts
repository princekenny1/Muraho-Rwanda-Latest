/**
 * useExhibitionAdmin — Exhibition mutation hook
 * ==============================================
 * Replaces: Legacy queries
 * Backend: Payload CMS /api/museum-exhibits
 *
 * Used by: ExhibitionAdminPanel
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useExhibitionAdmin() {
  const queryClient = useQueryClient();

  // ── Exhibition CRUD ─────────────────────────────────

  const createExhibition = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return api.create("museum-exhibits", toPayload(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
    },
  });

  const updateExhibition = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, any>) => {
      return api.update("museum-exhibits", id, toPayload(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
    },
  });

  const deleteExhibition = useMutation({
    mutationFn: async (id: string) => {
      return api.delete("museum-exhibits", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
    },
  });

  // ── Panel CRUD (embedded array) ─────────────────────

  const createPanel = useMutation({
    mutationFn: async (data: { exhibition_id: string } & Record<string, any>) => {
      const doc = await api.findById("museum-exhibits", data.exhibition_id, 0);
      const existing = (doc as any).panels || [];

      const newPanel = {
        title: data.title,
        panelNumber: data.panel_number,
        sectionLabel: data.section_label || undefined,
        durationMinutes: data.duration_minutes || 5,
        blocks: [],
      };

      return api.update("museum-exhibits", data.exhibition_id, {
        panels: [...existing, newPanel],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
      queryClient.invalidateQueries({ queryKey: ["exhibition-panels"] });
    },
  });

  const updatePanel = useMutation({
    mutationFn: async ({
      exhibition_id,
      panel_id,
      ...data
    }: {
      exhibition_id: string;
      panel_id: string;
    } & Record<string, any>) => {
      const doc = await api.findById("museum-exhibits", exhibition_id, 0);
      const panels = ((doc as any).panels || []).map((p: any) => {
        if (p.id === panel_id) {
          return {
            ...p,
            title: data.title ?? p.title,
            panelNumber: data.panel_number ?? p.panelNumber,
            sectionLabel: data.section_label ?? p.sectionLabel,
            durationMinutes: data.duration_minutes ?? p.durationMinutes,
          };
        }
        return p;
      });

      return api.update("museum-exhibits", exhibition_id, { panels });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibition-panels"] });
    },
  });

  const deletePanel = useMutation({
    mutationFn: async ({
      exhibition_id,
      panel_id,
    }: {
      exhibition_id: string;
      panel_id: string;
    }) => {
      const doc = await api.findById("museum-exhibits", exhibition_id, 0);
      const panels = ((doc as any).panels || []).filter(
        (p: any) => p.id !== panel_id
      );
      return api.update("museum-exhibits", exhibition_id, { panels });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibition-panels"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
    },
  });

  const reorderPanels = useMutation({
    mutationFn: async ({
      exhibition_id,
      panelIds,
    }: {
      exhibition_id: string;
      panelIds: string[];
    }) => {
      const doc = await api.findById("museum-exhibits", exhibition_id, 0);
      const existingPanels = (doc as any).panels || [];

      // Reorder by the provided ID order
      const reordered = panelIds
        .map((id, idx) => {
          const panel = existingPanels.find((p: any) => p.id === id);
          return panel ? { ...panel, panelNumber: idx + 1 } : null;
        })
        .filter(Boolean);

      return api.update("museum-exhibits", exhibition_id, {
        panels: reordered,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibition-panels"] });
    },
  });

  // ── Block CRUD (nested in panel) ────────────────────

  const createBlock = useMutation({
    mutationFn: async ({
      exhibition_id,
      panel_id,
      block_type,
      block_order,
      content,
    }: {
      exhibition_id: string;
      panel_id: string;
      block_type: string;
      block_order: number;
      content: Record<string, unknown>;
    }) => {
      const doc = await api.findById("museum-exhibits", exhibition_id, 0);
      const panels = ((doc as any).panels || []).map((p: any) => {
        if (p.id === panel_id) {
          return {
            ...p,
            blocks: [
              ...(p.blocks || []),
              { blockType: block_type, blockOrder: block_order, content },
            ],
          };
        }
        return p;
      });

      return api.update("museum-exhibits", exhibition_id, { panels });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panel-blocks"] });
    },
  });

  const updateBlock = useMutation({
    mutationFn: async ({
      exhibition_id,
      panel_id,
      block_id,
      ...data
    }: {
      exhibition_id: string;
      panel_id: string;
      block_id: string;
    } & Record<string, any>) => {
      const doc = await api.findById("museum-exhibits", exhibition_id, 0);
      const panels = ((doc as any).panels || []).map((p: any) => {
        if (p.id === panel_id) {
          const blocks = (p.blocks || []).map((b: any) => {
            if (b.id === block_id) {
              return {
                ...b,
                blockType: data.block_type ?? b.blockType,
                blockOrder: data.block_order ?? b.blockOrder,
                content: data.content ?? b.content,
              };
            }
            return b;
          });
          return { ...p, blocks };
        }
        return p;
      });

      return api.update("museum-exhibits", exhibition_id, { panels });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panel-blocks"] });
    },
  });

  const deleteBlock = useMutation({
    mutationFn: async ({
      exhibition_id,
      panel_id,
      block_id,
    }: {
      exhibition_id: string;
      panel_id: string;
      block_id: string;
    }) => {
      const doc = await api.findById("museum-exhibits", exhibition_id, 0);
      const panels = ((doc as any).panels || []).map((p: any) => {
        if (p.id === panel_id) {
          return {
            ...p,
            blocks: (p.blocks || []).filter((b: any) => b.id !== block_id),
          };
        }
        return p;
      });

      return api.update("museum-exhibits", exhibition_id, { panels });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panel-blocks"] });
    },
  });

  return {
    createExhibition,
    updateExhibition,
    deleteExhibition,
    createPanel,
    updatePanel,
    deletePanel,
    reorderPanels,
    createBlock,
    updateBlock,
    deleteBlock,
  };
}

function toPayload(data: Record<string, any>) {
  const mapped: Record<string, any> = {};
  if (data.title !== undefined) mapped.title = data.title;
  if (data.description !== undefined) mapped.description = data.description;
  if (data.image_url !== undefined) mapped.coverImage = data.image_url;
  if (data.is_permanent !== undefined) mapped.isPermanent = data.is_permanent;
  if (data.museum_id !== undefined) mapped.museum = data.museum_id;
  Object.keys(data).forEach((k) => {
    if (!(k in mapped) && !["id", "image_url", "is_permanent", "museum_id"].includes(k)) {
      mapped[k] = data[k];
    }
  });
  return mapped;
}
