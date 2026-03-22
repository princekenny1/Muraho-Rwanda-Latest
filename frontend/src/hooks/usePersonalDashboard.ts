/**
 * usePersonalDashboard — User's personal content tracking
 *
 * Replaces: Legacy
 * Payload collections: user-saved-items, user-progress, user-downloads
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAuth } from "./useAuth";

export type ContentType = "story" | "route" | "testimony" | "documentary";

export interface SavedItem {
  id: string;
  content_id: string;
  content_type: ContentType;
  title: string;
  image_url: string | null;
  created_at: string;
}

export interface ProgressItem {
  id: string;
  content_id: string;
  content_type: ContentType;
  title: string;
  image_url: string | null;
  progress_percent: number;
  last_position_seconds: number | null;
  updated_at: string;
}

export interface DownloadedItem {
  id: string;
  content_id: string;
  content_type: ContentType;
  title: string;
  image_url: string | null;
  download_size_mb: number | null;
  downloaded_at: string;
}

export function usePersonalDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch saved items
  const { data: savedItems = [], isLoading: savedLoading } = useQuery({
    queryKey: ["user-saved-items", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.find("user-saved-items", {
        where: { user: { equals: user.id } },
        sort: "-createdAt",
        limit: 10,
      });
      return (res.docs as any[]).map((d) => ({
        id: d.id,
        content_id: d.contentId,
        content_type: d.contentType as ContentType,
        title: d.title,
        image_url: d.imageUrl ?? null,
        created_at: d.createdAt,
      })) as SavedItem[];
    },
    enabled: !!user,
  });

  // Fetch progress items
  const { data: progressItems = [], isLoading: progressLoading } = useQuery({
    queryKey: ["user-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.find("user-progress", {
        where: {
          and: [
            { user: { equals: user.id } },
            { progressPercent: { greater_than: 0 } },
            { progressPercent: { less_than: 100 } },
          ],
        },
        sort: "-updatedAt",
        limit: 5,
      });
      return (res.docs as any[]).map((d) => ({
        id: d.id,
        content_id: d.contentId,
        content_type: d.contentType as ContentType,
        title: d.title,
        image_url: d.imageUrl ?? null,
        progress_percent: d.progressPercent,
        last_position_seconds: d.lastPositionSeconds ?? null,
        updated_at: d.updatedAt,
      })) as ProgressItem[];
    },
    enabled: !!user,
  });

  // Fetch downloaded items
  const { data: downloadedItems = [], isLoading: downloadsLoading } = useQuery({
    queryKey: ["user-downloads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.find("user-downloads", {
        where: { user: { equals: user.id } },
        sort: "-downloadedAt",
        limit: 5,
      });
      return (res.docs as any[]).map((d) => ({
        id: d.id,
        content_id: d.contentId,
        content_type: d.contentType as ContentType,
        title: d.title,
        image_url: d.imageUrl ?? null,
        download_size_mb: d.downloadSizeMb ?? null,
        downloaded_at: d.downloadedAt,
      })) as DownloadedItem[];
    },
    enabled: !!user,
  });

  // Save item (upsert pattern: find existing → update or create)
  const saveItemMutation = useMutation({
    mutationFn: async (item: {
      content_id: string;
      content_type: ContentType;
      title: string;
      image_url?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      // Check if already saved
      const existing = await api.find("user-saved-items", {
        where: {
          and: [
            { user: { equals: user.id } },
            { contentId: { equals: item.content_id } },
            { contentType: { equals: item.content_type } },
          ],
        },
        limit: 1,
      });
      const payload = {
        user: user.id,
        contentId: item.content_id,
        contentType: item.content_type,
        title: item.title,
        imageUrl: item.image_url || null,
      };
      if (existing.docs.length > 0) {
        return api.update("user-saved-items", existing.docs[0].id, payload);
      }
      return api.create("user-saved-items", payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-saved-items"] }),
  });

  const removeSavedItemMutation = useMutation({
    mutationFn: async (params: { content_id: string; content_type: ContentType }) => {
      if (!user) throw new Error("Not authenticated");
      const existing = await api.find("user-saved-items", {
        where: {
          and: [
            { user: { equals: user.id } },
            { contentId: { equals: params.content_id } },
            { contentType: { equals: params.content_type } },
          ],
        },
        limit: 1,
      });
      if (existing.docs.length > 0) {
        return api.delete("user-saved-items", existing.docs[0].id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-saved-items"] }),
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (item: {
      content_id: string;
      content_type: ContentType;
      title: string;
      image_url?: string;
      progress_percent: number;
      last_position_seconds?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const existing = await api.find("user-progress", {
        where: {
          and: [
            { user: { equals: user.id } },
            { contentId: { equals: item.content_id } },
            { contentType: { equals: item.content_type } },
          ],
        },
        limit: 1,
      });
      const payload = {
        user: user.id,
        contentId: item.content_id,
        contentType: item.content_type,
        title: item.title,
        imageUrl: item.image_url || null,
        progressPercent: item.progress_percent,
        lastPositionSeconds: item.last_position_seconds || 0,
      };
      if (existing.docs.length > 0) {
        return api.update("user-progress", existing.docs[0].id, payload);
      }
      return api.create("user-progress", payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-progress"] }),
  });

  const addDownloadMutation = useMutation({
    mutationFn: async (item: {
      content_id: string;
      content_type: ContentType;
      title: string;
      image_url?: string;
      download_size_mb?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const existing = await api.find("user-downloads", {
        where: {
          and: [
            { user: { equals: user.id } },
            { contentId: { equals: item.content_id } },
            { contentType: { equals: item.content_type } },
          ],
        },
        limit: 1,
      });
      const payload = {
        user: user.id,
        contentId: item.content_id,
        contentType: item.content_type,
        title: item.title,
        imageUrl: item.image_url || null,
        downloadSizeMb: item.download_size_mb || null,
      };
      if (existing.docs.length > 0) {
        return api.update("user-downloads", existing.docs[0].id, payload);
      }
      return api.create("user-downloads", payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-downloads"] }),
  });

  const removeDownloadMutation = useMutation({
    mutationFn: async (params: { content_id: string; content_type: ContentType }) => {
      if (!user) throw new Error("Not authenticated");
      const existing = await api.find("user-downloads", {
        where: {
          and: [
            { user: { equals: user.id } },
            { contentId: { equals: params.content_id } },
            { contentType: { equals: params.content_type } },
          ],
        },
        limit: 1,
      });
      if (existing.docs.length > 0) {
        return api.delete("user-downloads", existing.docs[0].id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-downloads"] }),
  });

  return {
    savedItems, progressItems, downloadedItems,
    isLoading: savedLoading || progressLoading || downloadsLoading,
    savedLoading, progressLoading, downloadsLoading,
    saveItem: saveItemMutation.mutate,
    removeSavedItem: removeSavedItemMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    addDownload: addDownloadMutation.mutate,
    removeDownload: removeDownloadMutation.mutate,
    isSaving: saveItemMutation.isPending,
    isUpdatingProgress: updateProgressMutation.isPending,
  };
}
