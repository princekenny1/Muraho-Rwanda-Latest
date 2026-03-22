import type { CollectionConfig } from "payload";
import { publicReadAdminWrite, publishedOrAdmin, isAdmin } from "../access";
import { autoSlug } from "../hooks";

/**
 * ROUTES (maps: public.routes)
 */
export const Routes: CollectionConfig = {
  slug: "routes",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "difficulty", "status", "updatedAt"],
    group: "Content",
  },
  access: { ...publicReadAdminWrite, read: publishedOrAdmin },
  versions: { drafts: true },
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "description", type: "textarea", localized: true },
    { name: "coverImage", type: "text" },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "durationMinutes", type: "number" },
    {
      name: "difficulty",
      type: "select",
      defaultValue: "moderate",
      options: [
        { label: "Easy", value: "easy" },
        { label: "Moderate", value: "moderate" },
        { label: "Challenging", value: "challenging" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "distanceKm", type: "number" },
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
    { name: "createdBy", type: "relationship", relationTo: "users" },
    { name: "publishedAt", type: "date" },
    // Relations
    {
      name: "stops",
      type: "relationship",
      relationTo: "route-stops",
      hasMany: true,
    },
    {
      name: "routePath",
      type: "json",
      admin: { description: "GeoJSON LineString" },
    },
  ],
};

/**
 * ROUTE STOPS (maps: public.route_stops)
 */
export const RouteStops: CollectionConfig = {
  slug: "route-stops",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "route", "stopOrder", "markerIcon"],
    group: "Content",
  },
  access: publicReadAdminWrite,
  fields: [
    {
      name: "route",
      type: "relationship",
      relationTo: "routes",
      required: true,
      index: true,
    },
    { name: "title", type: "text", required: true, localized: true },
    { name: "description", type: "textarea", localized: true },
    { name: "latitude", type: "number", required: true },
    { name: "longitude", type: "number", required: true },
    { name: "stopOrder", type: "number", required: true },
    { name: "estimatedTimeMinutes", type: "number", defaultValue: 15 },
    { name: "autoplayOnArrival", type: "checkbox", defaultValue: false },
    { name: "markerColor", type: "text", defaultValue: "#F97316" },
    {
      name: "markerIcon",
      type: "select",
      defaultValue: "location",
      options: [
        { label: "Location", value: "location" },
        { label: "Museum", value: "museum" },
        { label: "Culture", value: "culture" },
        { label: "History", value: "history" },
        { label: "Nature", value: "nature" },
        { label: "Food", value: "food" },
        { label: "Accommodation", value: "accommodation" },
      ],
    },
    { name: "linkedStory", type: "relationship", relationTo: "stories" },
    {
      name: "linkedTestimony",
      type: "relationship",
      relationTo: "testimonies",
    },
    // Embedded content blocks for simple cases
    {
      name: "contentBlocks",
      type: "array",
      fields: [
        {
          name: "blockType",
          type: "select",
          required: true,
          options: [
            { label: "Text", value: "text" },
            { label: "Image", value: "image" },
            { label: "Video", value: "video" },
            { label: "Audio", value: "audio" },
            { label: "Quote", value: "quote" },
            { label: "Fact", value: "fact" },
            { label: "Story Link", value: "story_link" },
            { label: "Testimony Link", value: "testimony_link" },
          ],
        },
        { name: "blockOrder", type: "number", required: true, defaultValue: 0 },
        { name: "content", type: "json", required: true },
      ],
    },
  ],
};

/**
 * STOP CONTENT BLOCKS (maps: public.stop_content_blocks)
 * Standalone collection for rich content blocks — used when blocks need
 * independent CRUD (e.g. route builder UI).
 */
export const StopContentBlocks: CollectionConfig = {
  slug: "stop-content-blocks",
  admin: {
    useAsTitle: "blockType",
    defaultColumns: ["stop", "blockType", "blockOrder"],
    group: "Content",
  },
  access: publicReadAdminWrite,
  fields: [
    {
      name: "stop",
      type: "relationship",
      relationTo: "route-stops",
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
        { label: "Video", value: "video" },
        { label: "Audio", value: "audio" },
        { label: "Quote", value: "quote" },
        { label: "Fact", value: "fact" },
        { label: "Story Link", value: "story_link" },
        { label: "Testimony Link", value: "testimony_link" },
      ],
    },
    { name: "blockOrder", type: "number", required: true },
    { name: "content", type: "json", required: true, defaultValue: {} },
  ],
};

/**
 * ROUTE VERSIONS (maps: public.route_versions)
 * Collaboration version history — snapshot of route state.
 */
export const RouteVersions: CollectionConfig = {
  slug: "route-versions",
  admin: {
    useAsTitle: "versionNumber",
    defaultColumns: ["route", "versionNumber", "createdBy", "createdAt"],
    group: "Content",
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    {
      name: "route",
      type: "relationship",
      relationTo: "routes",
      required: true,
      index: true,
    },
    { name: "versionNumber", type: "number", required: true },
    { name: "changesSummary", type: "textarea" },
    { name: "snapshot", type: "json", required: true },
    { name: "createdBy", type: "relationship", relationTo: "users" },
  ],
};

/**
 * ROUTE COMMENTS (maps: public.route_comments)
 * Collaboration comments on routes, stops, or blocks.
 */
export const RouteComments: CollectionConfig = {
  slug: "route-comments",
  admin: {
    useAsTitle: "comment",
    defaultColumns: ["route", "user", "resolved", "createdAt"],
    group: "Content",
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    {
      name: "route",
      type: "relationship",
      relationTo: "routes",
      required: true,
      index: true,
    },
    { name: "stop", type: "relationship", relationTo: "route-stops" },
    { name: "block", type: "relationship", relationTo: "stop-content-blocks" },
    { name: "user", type: "relationship", relationTo: "users", required: true },
    { name: "comment", type: "textarea", required: true },
    { name: "resolved", type: "checkbox", defaultValue: false },
  ],
};
