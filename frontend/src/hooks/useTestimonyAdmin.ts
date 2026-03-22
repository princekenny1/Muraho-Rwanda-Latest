/**
 * useTestimonyAdmin — Testimony mutation hook
 * ============================================
 * Replaces: Legacy queries
 * Backend: Payload CMS /api/testimonies
 *
 * Used by: TestimonyAdminPanel
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useTestimonyAdmin() {
  const queryClient = useQueryClient();

  const createTestimony = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return api.create("testimonies", toPayload(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonies"] });
    },
  });

  const updateTestimony = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, any>) => {
      return api.update("testimonies", id, toPayload(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonies"] });
    },
  });

  const deleteTestimony = useMutation({
    mutationFn: async (id: string) => {
      return api.delete("testimonies", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonies"] });
    },
  });

  return { createTestimony, updateTestimony, deleteTestimony };
}

// Map Lovable field names → Payload CMS field names
function toPayload(data: Record<string, any>) {
  const mapped: Record<string, any> = {};
  if (data.person_name !== undefined) mapped.personName = data.person_name;
  if (data.title !== undefined) mapped.title = data.title;
  if (data.context !== undefined) mapped.context = data.context;
  if (data.cover_image !== undefined) mapped.coverImage = data.cover_image;
  if (data.category !== undefined) mapped.category = data.category;
  if (data.location !== undefined) mapped.location = data.location;
  if (data.year !== undefined) mapped.year = data.year;
  if (data.duration_minutes !== undefined) mapped.durationMinutes = data.duration_minutes;
  if (data.has_content_warning !== undefined) mapped.hasContentWarning = data.has_content_warning;
  if (data.is_featured !== undefined) mapped.isFeatured = data.is_featured;
  if (data.video_url !== undefined) mapped.videoUrl = data.video_url;
  if (data.audio_url !== undefined) mapped.audioUrl = data.audio_url;
  if (data.captions_url !== undefined) mapped.captionsUrl = data.captions_url;
  if (data.sensitivity_level !== undefined) mapped.sensitivityLevel = data.sensitivity_level;
  if (data.consent_status !== undefined) mapped.consentStatus = data.consent_status;
  // Pass through any Payload-native fields
  const mappedSrc = ["id", "person_name", "cover_image", "duration_minutes", "has_content_warning", "is_featured", "video_url", "audio_url", "captions_url", "sensitivity_level", "consent_status"];
  Object.keys(data).forEach((k) => {
    if (!(k in mapped) && !mappedSrc.includes(k)) {
      mapped[k] = data[k];
    }
  });
  return mapped;
}
