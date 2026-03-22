/**
 * useContentCMS — Content management hooks for Payload CMS
 *
 * Replaces: Legacy
 * stories, story_blocks, quotes, content_tags, documentary_clips
 * Replaces: Legacy
 *
 * Payload collections: people, themes, locations, historical-events,
 * stories (with embedded blocks[]), quotes, content-tags, documentary-clips
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// ─── Types (snake_case for frontend compatibility) ────────────────────────────

export interface Person {
  id: string;
  name: string;
  slug: string;
  biography?: string;
  photo_url?: string;
  birth_year?: number;
  death_year?: number;
  role?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  location_type?: string;
  cover_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HistoricalEvent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  year?: number;
  event_type?: string;
  is_sensitive: boolean;
  created_at: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  hero_image?: string;
  status: string;
  is_featured: boolean;
  has_sensitive_content: boolean;
  sensitivity_level?: string;
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface StoryBlock {
  id: string;
  story_id: string;
  block_type: string;
  block_order: number;
  content: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  text: string;
  attribution?: string;
  source_url?: string;
  person_id?: string;
  testimony_id?: string;
  is_featured: boolean;
  created_at: string;
}

export interface ContentTag {
  id: string;
  content_id: string;
  content_type: string;
  tag_type: string;
  tag_id: string;
  created_at: string;
}

export interface DocumentaryClip {
  id: string;
  documentary_id: string;
  title: string;
  description?: string;
  video_url: string;
  start_time?: number;
  end_time?: number;
  thumbnail_url?: string;
  is_trailer: boolean;
  clip_order: number;
  created_at: string;
}

// ─── Field mappers ────────────────────────────────────────────────────────────

// Generic mapper: Payload camelCase → frontend snake_case
function mapDoc<T>(
  doc: Record<string, any>,
  fieldMap: Record<string, string>,
): T {
  const result: Record<string, any> = { id: doc.id };
  for (const [frontendKey, payloadKey] of Object.entries(fieldMap)) {
    result[frontendKey] = doc[payloadKey] ?? null;
  }
  result.created_at = doc.createdAt;
  if (doc.updatedAt) result.updated_at = doc.updatedAt;
  return result as T;
}

// Reverse: frontend snake_case → Payload camelCase
function toPayload(
  data: Record<string, any>,
  fieldMap: Record<string, string>,
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [frontendKey, payloadKey] of Object.entries(fieldMap)) {
    if (data[frontendKey] !== undefined) {
      result[payloadKey] = data[frontendKey];
    }
  }
  return result;
}

const personFields: Record<string, string> = {
  name: "name",
  slug: "slug",
  biography: "biography",
  photo_url: "photoUrl",
  birth_year: "birthYear",
  death_year: "deathYear",
  role: "role",
  is_public: "isPublic",
};

const themeFields: Record<string, string> = {
  name: "name",
  slug: "slug",
  description: "description",
  icon: "icon",
  color: "color",
  is_active: "isActive",
};

const locationFields: Record<string, string> = {
  name: "name",
  slug: "slug",
  description: "description",
  address: "address",
  latitude: "latitude",
  longitude: "longitude",
  location_type: "locationType",
  cover_image: "coverImage",
  is_active: "isActive",
};

const eventFields: Record<string, string> = {
  name: "name",
  slug: "slug",
  description: "description",
  start_date: "startDate",
  end_date: "endDate",
  year: "year",
  event_type: "eventType",
  is_sensitive: "isSensitive",
};

const storyFields: Record<string, string> = {
  title: "title",
  slug: "slug",
  summary: "summary",
  hero_image: "heroImage",
  status: "status",
  is_featured: "isFeatured",
  has_sensitive_content: "hasSensitiveContent",
  sensitivity_level: "sensitivityLevel",
  published_at: "publishedAt",
  created_by: "createdBy",
};

const blockFields: Record<string, string> = {
  story_id: "story",
  block_type: "blockType",
  block_order: "blockOrder",
  content: "content",
};

const quoteFields: Record<string, string> = {
  text: "text",
  attribution: "attribution",
  source_url: "sourceUrl",
  person_id: "person",
  testimony_id: "testimony",
  is_featured: "isFeatured",
};

const tagFields: Record<string, string> = {
  content_id: "contentId",
  content_type: "contentType",
  tag_type: "tagType",
  tag_id: "tagId",
};

const clipFields: Record<string, string> = {
  documentary_id: "documentary",
  title: "title",
  description: "description",
  video_url: "videoUrl",
  start_time: "startTime",
  end_time: "endTime",
  thumbnail_url: "thumbnailUrl",
  is_trailer: "isTrailer",
  clip_order: "clipOrder",
};

// ─── Slug helper ──────────────────────────────────────────────────────────────

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// ─── Generic CRUD factory ─────────────────────────────────────────────────────

function makeCRUD<T>(
  collection: string,
  queryKey: string,
  fieldMap: Record<string, string>,
  sortField = "name",
  queryClient: ReturnType<typeof useQueryClient>,
) {
  const useList = () =>
    useQuery({
      queryKey: [queryKey],
      queryFn: async () => {
        const res = await api.find(collection, { sort: sortField, limit: 500 });
        return (res.docs as Record<string, any>[]).map((d) =>
          mapDoc<T>(d, fieldMap),
        );
      },
    });

  const create = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const payload = toPayload(data, fieldMap);
      const doc = await api.create(collection, payload);
      return mapDoc<T>(doc as Record<string, any>, fieldMap);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Record<string, any>) => {
      const payload = toPayload(updates, fieldMap);
      const doc = await api.update(collection, id, payload);
      return mapDoc<T>(doc as Record<string, any>, fieldMap);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(collection, id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  return { useList, create, update, remove };
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useContentCMS() {
  const queryClient = useQueryClient();

  // ==================== PEOPLE ====================
  const peopleCRUD = makeCRUD<Person>(
    "people",
    "people",
    personFields,
    "name",
    queryClient,
  );
  const usePeople = peopleCRUD.useList;
  const createPerson = peopleCRUD.create;
  const updatePerson = peopleCRUD.update;
  const deletePerson = peopleCRUD.remove;

  // ==================== THEMES ====================
  const themeCRUD = makeCRUD<Theme>(
    "themes",
    "themes",
    themeFields,
    "name",
    queryClient,
  );
  const useThemes = themeCRUD.useList;
  const createTheme = themeCRUD.create;
  const updateTheme = themeCRUD.update;
  const deleteTheme = themeCRUD.remove;

  // ==================== LOCATIONS ====================
  const locationCRUD = makeCRUD<Location>(
    "locations",
    "locations",
    locationFields,
    "name",
    queryClient,
  );
  const useLocations = locationCRUD.useList;
  const createLocation = locationCRUD.create;
  const updateLocation = locationCRUD.update;
  const deleteLocation = locationCRUD.remove;

  // ==================== HISTORICAL EVENTS ====================
  const eventCRUD = makeCRUD<HistoricalEvent>(
    "historical-events",
    "historical_events",
    eventFields,
    "year",
    queryClient,
  );
  const useHistoricalEvents = eventCRUD.useList;
  const createHistoricalEvent = eventCRUD.create;
  const updateHistoricalEvent = eventCRUD.update;
  const deleteHistoricalEvent = eventCRUD.remove;

  // ==================== STORIES ====================
  const storyCRUD = makeCRUD<Story>(
    "stories",
    "stories",
    storyFields,
    "-createdAt",
    queryClient,
  );
  const useStories = storyCRUD.useList;
  const createStory = storyCRUD.create;
  const updateStory = storyCRUD.update;
  const deleteStory = storyCRUD.remove;

  const useStory = (id: string) =>
    useQuery({
      queryKey: ["story", id],
      queryFn: async () => {
        const doc = await api.findById("stories", id);
        return mapDoc<Story>(doc as Record<string, any>, storyFields);
      },
      enabled: !!id,
    });

  const publishStory = useMutation({
    mutationFn: async (id: string) => {
      const doc = await api.update("stories", id, {
        status: "published",
        publishedAt: new Date().toISOString(),
      });
      // Auto-index for RAG
      try {
        await fetch(`${api.baseURL}/index-content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ contentId: id, contentType: "story" }),
        });
      } catch (e) {
        console.warn("Failed to index story for RAG:", e);
      }
      return mapDoc<Story>(doc as Record<string, any>, storyFields);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["story", id] });
    },
  });

  // ==================== STORY BLOCKS ====================
  const useStoryBlocks = (storyId: string) =>
    useQuery({
      queryKey: ["story_blocks", storyId],
      queryFn: async () => {
        const res = await api.find("story-blocks", {
          where: { story: { equals: storyId } },
          sort: "blockOrder",
          limit: 200,
        });
        return (res.docs as Record<string, any>[]).map((d) =>
          mapDoc<StoryBlock>(d, blockFields),
        );
      },
      enabled: !!storyId,
    });

  const createStoryBlock = useMutation({
    mutationFn: async (data: {
      story_id: string;
      block_type: string;
      block_order: number;
      content: Record<string, any>;
    }) => {
      const payload = toPayload(data, blockFields);
      return api.create("story-blocks", payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["story_blocks", variables.story_id],
      });
    },
  });

  const updateStoryBlock = useMutation({
    mutationFn: async ({
      id,
      storyId,
      ...updates
    }: {
      id: string;
      storyId: string;
      content?: Record<string, any>;
      block_order?: number;
    }) => {
      const payload: Record<string, any> = {};
      if (updates.content !== undefined) payload.content = updates.content;
      if (updates.block_order !== undefined)
        payload.blockOrder = updates.block_order;
      return api.update("story-blocks", id, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["story_blocks", variables.storyId],
      });
    },
  });

  const deleteStoryBlock = useMutation({
    mutationFn: async ({ id }: { id: string; storyId: string }) => {
      return api.delete("story-blocks", id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["story_blocks", variables.storyId],
      });
    },
  });

  const reorderStoryBlocks = useMutation({
    mutationFn: async ({
      blocks,
    }: {
      blocks: { id: string; block_order: number }[];
      storyId: string;
    }) => {
      await Promise.all(
        blocks.map((b) =>
          api.update("story-blocks", b.id, { blockOrder: b.block_order }),
        ),
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["story_blocks", variables.storyId],
      });
    },
  });

  // ==================== QUOTES ====================
  const quoteCRUD = makeCRUD<Quote>(
    "quotes",
    "quotes",
    quoteFields,
    "-createdAt",
    queryClient,
  );
  const useQuotes = quoteCRUD.useList;
  const createQuote = quoteCRUD.create;
  const updateQuote = quoteCRUD.update;
  const deleteQuote = quoteCRUD.remove;

  // ==================== CONTENT TAGS ====================
  const useContentTags = (contentId: string, contentType: string) =>
    useQuery({
      queryKey: ["content_tags", contentId, contentType],
      queryFn: async () => {
        const res = await api.find("content-tags", {
          where: {
            and: [
              { contentId: { equals: contentId } },
              { contentType: { equals: contentType } },
            ],
          },
          limit: 200,
        });
        return (res.docs as Record<string, any>[]).map((d) =>
          mapDoc<ContentTag>(d, tagFields),
        );
      },
      enabled: !!contentId && !!contentType,
    });

  const addContentTag = useMutation({
    mutationFn: async (tag: Omit<ContentTag, "id" | "created_at">) => {
      return api.create(
        "content-tags",
        toPayload(tag as Record<string, any>, tagFields),
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "content_tags",
          variables.content_id,
          variables.content_type,
        ],
      });
    },
  });

  const removeContentTag = useMutation({
    mutationFn: async ({
      id,
    }: {
      id: string;
      contentId: string;
      contentType: string;
    }) => {
      return api.delete("content-tags", id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["content_tags", variables.contentId, variables.contentType],
      });
    },
  });

  // ==================== DOCUMENTARY CLIPS ====================
  const useDocumentaryClips = (documentaryId: string) =>
    useQuery({
      queryKey: ["documentary_clips", documentaryId],
      queryFn: async () => {
        const res = await api.find("documentary-clips", {
          where: { documentary: { equals: documentaryId } },
          sort: "clipOrder",
          limit: 200,
        });
        return (res.docs as Record<string, any>[]).map((d) =>
          mapDoc<DocumentaryClip>(d, clipFields),
        );
      },
      enabled: !!documentaryId,
    });

  const createDocumentaryClip = useMutation({
    mutationFn: async (clip: Omit<DocumentaryClip, "id" | "created_at">) => {
      return api.create(
        "documentary-clips",
        toPayload(clip as Record<string, any>, clipFields),
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documentary_clips", variables.documentary_id],
      });
    },
  });

  const updateDocumentaryClip = useMutation({
    mutationFn: async ({
      id,
      documentaryId,
      ...updates
    }: Partial<DocumentaryClip> & { id: string; documentaryId: string }) => {
      return api.update(
        "documentary-clips",
        id,
        toPayload(updates as Record<string, any>, clipFields),
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documentary_clips", variables.documentaryId],
      });
    },
  });

  const deleteDocumentaryClip = useMutation({
    mutationFn: async ({ id }: { id: string; documentaryId: string }) => {
      return api.delete("documentary-clips", id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documentary_clips", variables.documentaryId],
      });
    },
  });

  // ==================== RAG INDEXING ====================
  const indexEndpoint = async (contentId: string, contentType: string) => {
    const res = await fetch(`${api.baseURL}/index-content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ contentId, contentType }),
    });
    if (!res.ok) throw new Error(`Index failed: ${res.statusText}`);
    return res.json();
  };

  const indexContent = useMutation({
    mutationFn: async ({
      contentId,
      contentType,
    }: {
      contentId: string;
      contentType: string;
    }) => indexEndpoint(contentId, contentType),
  });

  const indexTestimony = useMutation({
    mutationFn: async (testimonyId: string) =>
      indexEndpoint(testimonyId, "testimony"),
  });

  const indexDocumentary = useMutation({
    mutationFn: async (documentaryId: string) =>
      indexEndpoint(documentaryId, "documentary"),
  });

  const indexPanel = useMutation({
    mutationFn: async (panelId: string) => indexEndpoint(panelId, "panel"),
  });

  const indexQuote = useMutation({
    mutationFn: async (quoteId: string) => indexEndpoint(quoteId, "quote"),
  });

  const batchIndexContent = useMutation({
    mutationFn: async (
      items: Array<{ contentId: string; contentType: string }>,
    ) => {
      return Promise.allSettled(
        items.map((i) => indexEndpoint(i.contentId, i.contentType)),
      );
    },
  });

  return {
    // People
    usePeople,
    createPerson,
    updatePerson,
    deletePerson,
    // Themes
    useThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    // Locations
    useLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    // Historical Events
    useHistoricalEvents,
    createHistoricalEvent,
    updateHistoricalEvent,
    deleteHistoricalEvent,
    // Stories
    useStories,
    useStory,
    createStory,
    updateStory,
    deleteStory,
    publishStory,
    // Story Blocks
    useStoryBlocks,
    createStoryBlock,
    updateStoryBlock,
    deleteStoryBlock,
    reorderStoryBlocks,
    // Quotes
    useQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    // Content Tags
    useContentTags,
    addContentTag,
    removeContentTag,
    // Documentary Clips
    useDocumentaryClips,
    createDocumentaryClip,
    updateDocumentaryClip,
    deleteDocumentaryClip,
    // RAG Indexing
    indexContent,
    indexTestimony,
    indexDocumentary,
    indexPanel,
    indexQuote,
    batchIndexContent,
    // Helpers
    generateSlug,
  };
}
