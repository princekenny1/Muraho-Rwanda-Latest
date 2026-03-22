import type { CollectionConfig } from "payload";
import {
  publicReadAdminWrite,
  publishedOrAdmin,
  isAdmin,
  publicRead,
} from "../access";
import { autoSlug } from "../hooks";

// ── 1. PEOPLE (maps: public.people) ─────────────────────
export const People: CollectionConfig = {
  slug: "people",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "birthYear"],
    group: "Content",
  },
  access: publicReadAdminWrite,
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "biography", type: "textarea", localized: true },
    { name: "photoUrl", type: "text" },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "birthYear", type: "number" },
    { name: "deathYear", type: "number" },
    {
      name: "role",
      type: "select",
      options: [
        { label: "Survivor", value: "survivor" },
        { label: "Witness", value: "witness" },
        { label: "Rescuer", value: "rescuer" },
        { label: "Historical Figure", value: "historical_figure" },
        { label: "Leader", value: "leader" },
        { label: "Artist / Creator", value: "artist" },
        { label: "Narrator", value: "narrator" },
        { label: "Expert", value: "expert" },
      ],
    },
    { name: "isPublic", type: "checkbox", defaultValue: true },
  ],
};

// ── 2. THEMES (maps: public.themes) ──────────────────────
export const Themes: CollectionConfig = {
  slug: "themes",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "isActive"],
    group: "Content",
  },
  access: publicReadAdminWrite,
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "name", type: "text", required: true, unique: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "description", type: "textarea", localized: true },
    { name: "icon", type: "text", admin: { description: "Lucide icon name" } },
    { name: "color", type: "text", defaultValue: "#4B5573" },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
  ],
};

// ── 3. LOCATIONS (maps: public.locations) ────────────────
export const Locations: CollectionConfig = {
  slug: "locations",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "locationType", "isActive"],
    group: "Places",
  },
  access: publicReadAdminWrite,
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "description", type: "textarea", localized: true },
    { name: "address", type: "text" },
    { name: "latitude", type: "number" },
    { name: "longitude", type: "number" },
    {
      name: "locationType",
      type: "select",
      options: [
        { label: "Memorial", value: "memorial" },
        { label: "Museum", value: "museum" },
        { label: "Historical Site", value: "historical_site" },
        { label: "City", value: "city" },
        { label: "Region", value: "region" },
        { label: "National Park", value: "national_park" },
      ],
    },
    { name: "coverImage", type: "upload", relationTo: "media" },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
  ],
};

// ── 4. HISTORICAL EVENTS (maps: public.historical_events) ─
// SLUG FIX: was "events", now "historical-events" to match frontend
export const HistoricalEvents: CollectionConfig = {
  slug: "historical-events",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "year", "eventType", "isSensitive"],
    group: "Content",
  },
  access: publicReadAdminWrite,
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "description", type: "textarea", localized: true },
    { name: "startDate", type: "date" },
    { name: "endDate", type: "date" },
    { name: "year", type: "number" },
    {
      name: "eventType",
      type: "select",
      options: [
        { label: "Period", value: "period" },
        { label: "Incident", value: "incident" },
        { label: "Milestone", value: "milestone" },
        { label: "Commemoration", value: "commemoration" },
      ],
    },
    {
      name: "isSensitive",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
  ],
};

// ── 5. STORIES (maps: public.stories) ────────────────────
export const Stories: CollectionConfig = {
  slug: "stories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "isFeatured", "updatedAt"],
    group: "Content",
  },
  access: { ...publicReadAdminWrite, read: publishedOrAdmin },
  versions: { drafts: true },
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "summary", type: "textarea", localized: true },
    { name: "body", type: "richText", localized: true },
    { name: "heroImage", type: "upload", relationTo: "media" },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    { name: "hasSensitiveContent", type: "checkbox", defaultValue: false },
    {
      name: "sensitivityLevel",
      type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
    },
    { name: "publishedAt", type: "date" },
    { name: "createdBy", type: "relationship", relationTo: "users" },
    // Relations
    {
      name: "themes",
      type: "relationship",
      relationTo: "themes",
      hasMany: true,
    },
    { name: "location", type: "relationship", relationTo: "locations" },
    {
      name: "relatedPeople",
      type: "relationship",
      relationTo: "people",
      hasMany: true,
    },
    {
      name: "relatedStories",
      type: "relationship",
      relationTo: "stories",
      hasMany: true,
    },
    {
      name: "relatedTestimonies",
      type: "relationship",
      relationTo: "testimonies",
      hasMany: true,
    },
  ],
};

// ── 6. STORY BLOCKS (maps: public.story_blocks) ─────────
export const StoryBlocks: CollectionConfig = {
  slug: "story-blocks",
  admin: {
    useAsTitle: "blockType",
    defaultColumns: ["story", "blockType", "blockOrder"],
    group: "Content",
  },
  access: publicReadAdminWrite,
  fields: [
    {
      name: "story",
      type: "relationship",
      relationTo: "stories",
      required: true,
      index: true,
    },
    {
      name: "blockType",
      type: "select",
      required: true,
      options: [
        { label: "Text", value: "text" },
        { label: "Image", value: "image" },
        { label: "Gallery", value: "gallery" },
        { label: "Video", value: "video" },
        { label: "Audio", value: "audio" },
        { label: "Quote", value: "quote" },
        { label: "Timeline", value: "timeline" },
        { label: "Map", value: "map" },
        { label: "Then & Now", value: "then_now" },
        { label: "Linked Testimony", value: "linked_testimony" },
        { label: "Linked Story", value: "linked_story" },
      ],
    },
    { name: "blockOrder", type: "number", required: true, defaultValue: 1 },
    { name: "content", type: "json", required: true },
  ],
};

// ── 7. QUOTES (maps: public.quotes) ─────────────────────
export const Quotes: CollectionConfig = {
  slug: "quotes",
  admin: {
    useAsTitle: "text",
    defaultColumns: ["text", "attribution", "isFeatured"],
    group: "Content",
  },
  access: publicReadAdminWrite,
  fields: [
    { name: "text", type: "textarea", required: true, localized: true },
    { name: "attribution", type: "text" },
    { name: "sourceUrl", type: "text" },
    { name: "person", type: "relationship", relationTo: "people" },
    { name: "testimony", type: "relationship", relationTo: "testimonies" },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
  ],
};

// ── 8. CONTENT TAGS (maps: public.content_tags) ─────────
export const ContentTags: CollectionConfig = {
  slug: "content-tags",
  admin: {
    useAsTitle: "contentType",
    defaultColumns: ["contentType", "contentId", "tagType", "tagId"],
    group: "Content",
  },
  access: publicReadAdminWrite,
  fields: [
    { name: "contentId", type: "text", required: true, index: true },
    {
      name: "contentType",
      type: "select",
      required: true,
      options: [
        { label: "Story", value: "story" },
        { label: "Testimony", value: "testimony" },
        { label: "Documentary", value: "documentary" },
        { label: "Panel", value: "panel" },
        { label: "Quote", value: "quote" },
      ],
    },
    {
      name: "tagType",
      type: "select",
      required: true,
      options: [
        { label: "Theme", value: "theme" },
        { label: "Location", value: "location" },
        { label: "Person", value: "person" },
        { label: "Event", value: "event" },
        { label: "Museum", value: "museum" },
        { label: "Route", value: "route" },
      ],
    },
    { name: "tagId", type: "text", required: true, index: true },
  ],
};

// ── 9. CONTENT EMBEDDINGS (maps: public.content_embeddings) ─
export const ContentEmbeddings: CollectionConfig = {
  slug: "content-embeddings",
  admin: {
    useAsTitle: "contentType",
    defaultColumns: ["contentType", "contentId", "embeddingStatus"],
    group: "AI",
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: "contentId", type: "text", required: true, index: true },
    { name: "contentType", type: "text", required: true },
    { name: "textContent", type: "textarea", required: true },
    { name: "metadata", type: "json", defaultValue: {} },
    {
      name: "embeddingStatus",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
      ],
    },
    { name: "indexedAt", type: "date" },
  ],
};

// ── 10. DOCUMENTARY CLIPS (maps: public.documentary_clips) ─
export const DocumentaryClips: CollectionConfig = {
  slug: "documentary-clips",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["documentary", "title", "clipOrder", "isTrailer"],
    group: "Content",
  },
  access: publicReadAdminWrite,
  fields: [
    {
      name: "documentary",
      type: "relationship",
      relationTo: "documentaries",
      required: true,
      index: true,
    },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "videoUrl", type: "text", required: true },
    {
      name: "startTime",
      type: "number",
      admin: { description: "Seconds from start" },
    },
    { name: "endTime", type: "number" },
    { name: "thumbnailUrl", type: "text" },
    { name: "isTrailer", type: "checkbox", defaultValue: false },
    { name: "clipOrder", type: "number", defaultValue: 1 },
  ],
};
