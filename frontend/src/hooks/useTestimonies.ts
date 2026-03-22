/**
 * useTestimonies — Testimony data hook
 * =====================================
 * Replaces: Legacy queries
 * Backend: Payload CMS /api/testimonies
 *
 * Exports: Testimony type, useTestimonies()
 * Used by: TestimonyAdminPanel, TestimonyAdminCard, TestimonyForm, TestimonyViewer
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// ── Type ──────────────────────────────────────────────

export interface TranscriptSegment {
  time: number; // seconds
  text: string;
  isPullQuote?: boolean;
  speaker?: string;
  image?: { src: string; alt: string; caption?: string };
}

export interface TestimonySource {
  name: string;
  url?: string;
}

export interface Testimony {
  id: string;
  title: string;
  slug: string;
  person_name: string;
  context: string;
  cover_image: string;
  category: "survivor" | "rescuer" | "witness" | "reconciliation";
  location?: string | null;
  year?: number | null;
  duration_minutes?: number | null;
  has_content_warning: boolean;
  is_featured: boolean;
  video_url?: string | null;
  captions_url?: string | null;
  audio_url?: string | null;
  // Structured transcript for read mode + synced highlighting
  transcript_segments: TranscriptSegment[];
  // Flat transcript text (concatenated from segments)
  transcript?: string | null;
  // Attribution sources
  sources: TestimonySource[];
  sensitivityLevel?: "standard" | "sensitive" | "highly_sensitive";
  accessTier?: "free" | "premium";
  createdAt: string;
  updatedAt: string;
}

// ── Query Hook ────────────────────────────────────────

export function useTestimonies(options?: {
  category?: string;
  featured?: boolean;
}) {
  return useQuery<Testimony[]>({
    queryKey: ["testimonies", options],
    queryFn: async () => {
      const where: Record<string, any> = {};
      if (options?.category) {
        where.category = { equals: options.category };
      }
      if (options?.featured) {
        where.isFeatured = { equals: true };
      }

      const result = await api.find("testimonies", {
        where: Object.keys(where).length > 0 ? where : undefined,
        sort: "-createdAt",
        limit: 100,
        depth: 0,
      });

      return (result.docs as any[]).map(mapTestimony);
    },
  });
}

/** Convenience hook for featured testimonies on home page */
export function useFeaturedTestimonies() {
  return useTestimonies({ featured: true });
}

export function useTestimony(slug: string) {
  return useQuery<Testimony | null>({
    queryKey: ["testimony", slug],
    queryFn: async () => {
      const doc = await api.findOne("testimonies", {
        slug: { equals: slug },
      });
      return doc ? mapTestimony(doc) : null;
    },
    enabled: !!slug,
  });
}

// ── Field mapper (Payload → Lovable shape) ────────────

function mapTestimony(doc: any): Testimony {
  // Parse transcript segments from backend JSON field
  const rawSegments = doc.transcriptSegments || doc.transcript_segments || [];
  const segments: TranscriptSegment[] = Array.isArray(rawSegments)
    ? rawSegments.map((s: any) => ({
        time: s.time ?? s.startTime ?? 0,
        text: s.text || "",
        isPullQuote: s.isPullQuote ?? false,
        speaker: s.speaker || undefined,
        image: s.image || undefined,
      }))
    : [];

  // Parse sources
  const rawSources = doc.sources || [];
  const sources: TestimonySource[] = Array.isArray(rawSources)
    ? rawSources.map((s: any) => ({
        name: s.name || s.title || "",
        url: s.url || undefined,
      }))
    : [];

  // Build flat transcript text from segments
  const transcriptText =
    doc.transcript ||
    (segments.length > 0
      ? segments
          .filter((s) => !s.isPullQuote)
          .map((s) => s.text)
          .join(" ")
      : null);

  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    person_name: doc.personName || doc.person_name || "",
    context: doc.context || doc.description || "",
    cover_image: doc.heroImage?.url || doc.coverImage || doc.cover_image || "",
    category: doc.category || "survivor",
    location: doc.location || null,
    year: doc.year || null,
    duration_minutes: doc.durationMinutes || doc.duration_minutes || null,
    has_content_warning:
      doc.hasContentWarning ?? doc.has_content_warning ?? true,
    is_featured: doc.isFeatured ?? doc.featured ?? doc.is_featured ?? false,
    video_url: doc.videoUrl || doc.video_url || null,
    captions_url: doc.captionsUrl || doc.captions_url || null,
    audio_url: doc.audioFile?.url || doc.audioUrl || doc.audio_url || null,
    transcript_segments: segments,
    transcript: transcriptText,
    sources,
    sensitivityLevel: doc.sensitivityLevel || "standard",
    accessTier: doc.accessTier || "free",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
