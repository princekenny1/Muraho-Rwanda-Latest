/**
 * useDocumentaryAdmin — Documentary mutation hook
 * ================================================
 * Replaces: Legacy queries
 * Backend: Payload CMS /api/documentaries
 *
 * Chapters are stored as an embedded array in the Documentaries collection,
 * so chapter CRUD = update the parent documentary's chapters array.
 *
 * Used by: DocumentaryAdminPanel
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useDocumentaryAdmin() {
  const queryClient = useQueryClient();

  const createDocumentary = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return api.create("documentaries", toPayload(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentaries"] });
    },
  });

  const updateDocumentary = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, any>) => {
      return api.update("documentaries", id, toPayload(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentaries"] });
      queryClient.invalidateQueries({ queryKey: ["documentary-chapters"] });
    },
  });

  const deleteDocumentary = useMutation({
    mutationFn: async (id: string) => {
      return api.delete("documentaries", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentaries"] });
    },
  });

  // ── Chapter mutations (operate on embedded array) ───

  const createChapter = useMutation({
    mutationFn: async (data: {
      documentary_id: string;
      title: string;
      chapter_number: number;
      duration: number;
      type: string;
    }) => {
      // Fetch current documentary to get existing chapters
      const doc = await api.findById("documentaries", data.documentary_id, 0);
      const existing = (doc as any).chapters || [];

      const newChapter = {
        title: data.title,
        chapterNumber: data.chapter_number,
        duration: data.duration,
        type: data.type,
      };

      return api.update("documentaries", data.documentary_id, {
        chapters: [...existing, newChapter],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentary-chapters"] });
      queryClient.invalidateQueries({ queryKey: ["documentaries"] });
    },
  });

  const updateChapter = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; documentary_id?: string } & Record<string, any>) => {
      // We need the documentary_id to find the parent
      // The chapter id is used to find the chapter within the array
      const docId = data.documentary_id;
      if (!docId) throw new Error("documentary_id required to update chapter");

      const doc = await api.findById("documentaries", docId, 0);
      const chapters = ((doc as any).chapters || []).map((ch: any) => {
        if (ch.id === id) {
          return {
            ...ch,
            title: data.title ?? ch.title,
            chapterNumber: data.chapter_number ?? ch.chapterNumber,
            duration: data.duration ?? ch.duration,
            type: data.type ?? ch.type,
          };
        }
        return ch;
      });

      return api.update("documentaries", docId, { chapters });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentary-chapters"] });
      queryClient.invalidateQueries({ queryKey: ["documentaries"] });
    },
  });

  const deleteChapter = useMutation({
    mutationFn: async (chapterId: string) => {
      // Need to find which documentary contains this chapter
      // In practice, the admin panel tracks which documentary is active
      // We'll accept a composite ID or search
      throw new Error("Use deleteChapterFromDoc instead");
    },
  });

  const deleteChapterFromDoc = useMutation({
    mutationFn: async ({ documentaryId, chapterId }: { documentaryId: string; chapterId: string }) => {
      const doc = await api.findById("documentaries", documentaryId, 0);
      const chapters = ((doc as any).chapters || []).filter(
        (ch: any) => ch.id !== chapterId
      );
      return api.update("documentaries", documentaryId, { chapters });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentary-chapters"] });
      queryClient.invalidateQueries({ queryKey: ["documentaries"] });
    },
  });

  return {
    createDocumentary,
    updateDocumentary,
    deleteDocumentary,
    createChapter,
    updateChapter,
    deleteChapter: deleteChapterFromDoc,
  };
}

function toPayload(data: Record<string, any>) {
  const mapped: Record<string, any> = {};
  if (data.title !== undefined) mapped.title = data.title;
  if (data.synopsis !== undefined) mapped.synopsis = data.synopsis;
  if (data.cover_image !== undefined) mapped.coverImage = data.cover_image;
  if (data.hero_image !== undefined) mapped.heroImage = data.hero_image;
  if (data.runtime !== undefined) mapped.runtime = data.runtime;
  if (data.year !== undefined) mapped.year = data.year;
  if (data.director !== undefined) mapped.director = data.director;
  if (data.type !== undefined) mapped.type = data.type;
  if (data.is_new !== undefined) mapped.isNew = data.is_new;
  if (data.is_featured !== undefined) mapped.isFeatured = data.is_featured;
  if (data.video_url !== undefined) mapped.videoUrl = data.video_url;
  if (data.trailer_url !== undefined) mapped.trailerUrl = data.trailer_url;
  if (data.content_warning !== undefined) mapped.contentWarning = data.content_warning;
  if (data.sensitivity_level !== undefined) mapped.sensitivityLevel = data.sensitivity_level;
  // Pass through any Payload-native fields not already mapped
  const mappedSrc = ["id", "synopsis", "cover_image", "hero_image", "runtime", "type", "is_new", "is_featured", "video_url", "trailer_url", "content_warning", "sensitivity_level"];
  Object.keys(data).forEach((k) => {
    if (!(k in mapped) && !mappedSrc.includes(k)) {
      mapped[k] = data[k];
    }
  });
  return mapped;
}
