/**
 * useExhibitions — Exhibition data hooks
 * =======================================
 * Replaces: Legacy queries
 * Backend: Payload CMS /api/museum-exhibits
 *
 * Exports: Exhibition, ExhibitionPanel, PanelBlock types
 *          useExhibitions(), useExhibitionPanels(), usePanelBlocks()
 * Used by: ExhibitionAdminPanel, ExhibitionForm, PanelForm, PanelBlockForm
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// ── Types ─────────────────────────────────────────────

export interface Exhibition {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  is_permanent: boolean;
  museum_id?: string;
  panel_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExhibitionPanel {
  id: string;
  exhibition_id: string;
  title: string;
  panel_number: number;
  section_label?: string | null;
  duration_minutes: number;
  block_count?: number;
}

export interface PanelBlock {
  id: string;
  panel_id: string;
  block_type: "text" | "quote" | "video" | "audio" | "context";
  block_order: number;
  content: Record<string, unknown>;
}

// ── Query Hooks ───────────────────────────────────────

export function useExhibitions(museumId?: string) {
  return useQuery<Exhibition[]>({
    queryKey: ["exhibitions", museumId],
    queryFn: async () => {
      const where: Record<string, any> = {};
      if (museumId) where.museum = { equals: museumId };

      const result = await api.find("museum-exhibits", {
        where: Object.keys(where).length > 0 ? where : undefined,
        sort: "title",
        limit: 100,
        depth: 1,
      });

      return (result.docs as any[]).map(mapExhibition);
    },
  });
}

export function useExhibitionPanels(exhibitionId?: string) {
  return useQuery<ExhibitionPanel[]>({
    queryKey: ["exhibition-panels", exhibitionId],
    queryFn: async () => {
      if (!exhibitionId) return [];

      // Panels are embedded in the exhibit document
      const doc = await api.findById("museum-exhibits", exhibitionId, 1);
      if (!doc) return [];

      const panels = (doc as any).panels || [];
      return panels.map((p: any, i: number) => mapPanel(p, exhibitionId, i));
    },
    enabled: !!exhibitionId,
  });
}

export function usePanelBlocks(panelId?: string, exhibitionId?: string) {
  return useQuery<PanelBlock[]>({
    queryKey: ["panel-blocks", exhibitionId, panelId],
    queryFn: async () => {
      if (!exhibitionId || !panelId) return [];

      const doc = await api.findById("museum-exhibits", exhibitionId, 2);
      if (!doc) return [];

      const panels = (doc as any).panels || [];
      const panel = panels.find((p: any) => p.id === panelId);
      if (!panel) return [];

      const blocks = panel.blocks || [];
      return blocks.map((b: any, i: number) => mapBlock(b, panelId, i));
    },
    enabled: !!panelId && !!exhibitionId,
  });
}

// ── Field mappers ─────────────────────────────────────

function mapExhibition(doc: any): Exhibition {
  return {
    id: doc.id,
    title: doc.title || doc.exhibitionName || "",
    description: doc.description || null,
    image_url: doc.coverImage?.url || doc.image_url || null,
    is_permanent: doc.isPermanent ?? doc.is_permanent ?? true,
    museum_id: typeof doc.museum === "object" ? doc.museum?.id : doc.museum,
    panel_count: doc.panels?.length || 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function mapPanel(p: any, exhibitionId: string, index: number): ExhibitionPanel {
  return {
    id: p.id || `panel-${index}`,
    exhibition_id: exhibitionId,
    title: p.title || `Panel ${index + 1}`,
    panel_number: p.panelNumber || p.panel_number || index + 1,
    section_label: p.sectionLabel || p.section_label || null,
    duration_minutes: p.durationMinutes || p.duration_minutes || 5,
    block_count: p.blocks?.length || 0,
  };
}

function mapBlock(b: any, panelId: string, index: number): PanelBlock {
  return {
    id: b.id || `block-${index}`,
    panel_id: panelId,
    block_type: b.blockType || b.block_type || "text",
    block_order: b.blockOrder || b.block_order || index + 1,
    content: b.content || {},
  };
}
