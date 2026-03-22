/**
 * useDocumentaries — Documentary data hooks
 * ==========================================
 * Replaces: Legacy queries
 * Backend: Payload CMS /api/documentaries
 *
 * Exports: Documentary, Chapter types, useDocumentaries(), useDocumentaryChapters()
 * Used by: DocumentaryAdminPanel, DocumentaryAdminCard, DocumentaryForm, ChapterForm
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// ── Types ─────────────────────────────────────────────

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
}

export interface DocPhoto {
  id: string;
  url: string;
  caption?: string;
  year?: number;
}

export interface DocEssay {
  id: string;
  title: string;
  author: string;
  excerpt?: string;
  url?: string;
}

export interface DocSource {
  id: string;
  name: string;
  type?: string;
  institution?: string;
  url?: string;
}

export interface DocDownload {
  id: string;
  name: string;
  type: "transcript" | "photos" | "study-guide" | "other";
  size?: string;
  fileUrl?: string;
}

export interface Documentary {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  cover_image: string;
  video_url?: string | null;
  trailer_url?: string | null;
  runtime: number;
  year: number;
  director?: string | null;
  type: "historical" | "survivor-stories" | "cultural" | "educational";
  is_new: boolean;
  is_featured: boolean;
  chapters_count?: number;
  // Supplementary data
  photos: DocPhoto[];
  essays: DocEssay[];
  sources: DocSource[];
  downloads: DocDownload[];
  content_warning?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  documentary_id: string;
  title: string;
  chapter_number: number;
  duration: number;
  type: "narrative" | "interview" | "archival" | "map" | "documentary";
  // Transcript segments for this chapter
  transcripts: TranscriptSegment[];
  createdAt: string;
}

// ── Query Hooks ───────────────────────────────────────

export function useDocumentaries(options?: {
  type?: string;
  featured?: boolean;
}) {
  return useQuery<Documentary[]>({
    queryKey: ["documentaries", options],
    queryFn: async () => {
      const where: Record<string, any> = {};
      if (options?.type) where.type = { equals: options.type };
      if (options?.featured) where.isFeatured = { equals: true };

      const result = await api.find("documentaries", {
        where: Object.keys(where).length > 0 ? where : undefined,
        sort: "-createdAt",
        limit: 100,
        depth: 0,
      });

      return (result.docs as any[]).map(mapDocumentary);
    },
  });
}

/** Convenience hook for the first featured documentary (home page) */
export function useFeaturedDocumentary() {
  const result = useDocumentaries({ featured: true });
  return {
    ...result,
    data: (result.data ?? [])[0] ?? null,
  };
}

export function useDocumentary(slug: string) {
  return useQuery<Documentary | null>({
    queryKey: ["documentary", slug],
    queryFn: async () => {
      const doc = await api.findOne(
        "documentaries",
        {
          slug: { equals: slug },
        },
        2,
      );
      return doc ? mapDocumentary(doc) : null;
    },
    enabled: !!slug,
  });
}

export function useDocumentaryChapters(documentaryId?: string) {
  return useQuery<Chapter[]>({
    queryKey: ["documentary-chapters", documentaryId],
    queryFn: async () => {
      if (!documentaryId) return [];

      // Chapters are embedded in the documentary as an array field
      const doc = await api.findById("documentaries", documentaryId, 1);
      if (!doc) return [];

      const chapters = (doc as any).chapters || [];
      return chapters.map((ch: any, i: number) =>
        mapChapter(ch, documentaryId, i),
      );
    },
    enabled: !!documentaryId,
  });
}

// ── Field mappers ─────────────────────────────────────

function mapDocumentary(doc: any): Documentary {
  // Map supplementary photos
  const photos: DocPhoto[] = (doc.photos || []).map((p: any, i: number) => ({
    id: p.id || `photo-${i}`,
    url: p.image?.url || p.url || "",
    caption: p.caption || undefined,
    year: p.year || undefined,
  }));

  // Map essays
  const essays: DocEssay[] = (doc.essays || []).map((e: any, i: number) => ({
    id: e.id || `essay-${i}`,
    title: e.title || "",
    author: e.author || "",
    excerpt: e.excerpt || undefined,
    url: e.url || undefined,
  }));

  // Map sources
  const sources: DocSource[] = (doc.sources || []).map((s: any, i: number) => ({
    id: s.id || `source-${i}`,
    name: s.name || "",
    type: s.type || undefined,
    institution: s.institution || undefined,
    url: s.url || undefined,
  }));

  // Map downloads
  const downloads: DocDownload[] = (doc.downloads || []).map(
    (d: any, i: number) => ({
      id: d.id || `download-${i}`,
      name: d.name || "",
      type: d.type || "other",
      size: d.size || undefined,
      fileUrl: d.file?.url || undefined,
    }),
  );

  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    synopsis: doc.description || doc.synopsis || "",
    cover_image: doc.heroImage?.url || doc.coverImage || doc.cover_image || "",
    video_url: doc.videoUrl || doc.video_url || null,
    trailer_url: doc.trailerUrl || doc.trailer_url || null,
    runtime: doc.durationMinutes || doc.runtime || 0,
    year: doc.year || new Date().getFullYear(),
    director: doc.director || null,
    type: doc.type || doc.category || "historical",
    is_new: doc.isNew ?? doc.is_new ?? false,
    is_featured: doc.isFeatured ?? doc.featured ?? doc.is_featured ?? false,
    chapters_count: doc.chapters?.length || 0,
    photos,
    essays,
    sources,
    downloads,
    content_warning: doc.contentWarning || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function mapChapter(ch: any, documentaryId: string, index: number): Chapter {
  // Map embedded transcript segments
  const transcripts: TranscriptSegment[] = (ch.transcripts || []).map(
    (t: any, ti: number) => ({
      id: t.id || `transcript-${index}-${ti}`,
      startTime: t.startTime ?? 0,
      endTime: t.endTime ?? 0,
      text: t.text || "",
      speaker: t.speaker || undefined,
    }),
  );

  return {
    id: ch.id || `chapter-${index}`,
    documentary_id: documentaryId,
    title: ch.title || `Chapter ${index + 1}`,
    chapter_number: ch.chapterNumber || index + 1,
    duration: ch.durationMinutes || ch.duration || 5,
    type: ch.type || "narrative",
    transcripts,
    createdAt: ch.createdAt || new Date().toISOString(),
  };
}
