import type { CollectionConfig } from "payload";
import { publicReadAdminWrite } from "../access";
import { autoSlug } from "../hooks";

/**
 * MUSEUMS (maps: public.museums)
 * Full museum management with indoor flow, outdoor map, kid mode settings.
 */
export const Museums: CollectionConfig = {
  slug: "museums",
  admin: { useAsTitle: "name", defaultColumns: ["name", "slug", "isFeatured", "isActive"], group: "Places" },
  access: publicReadAdminWrite,
  versions: { drafts: true },
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "description", type: "richText", localized: true },
    { name: "shortDescription", type: "textarea", localized: true },
    { name: "coverImage", type: "text" },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "heroGallery", type: "json", defaultValue: [] },
    { name: "latitude", type: "number" },
    { name: "longitude", type: "number" },
    { name: "address", type: "text" },
    { name: "openingHours", type: "json", defaultValue: {} },
    { name: "etiquette", type: "textarea", localized: true },
    { name: "contactInfo", type: "json", defaultValue: {} },
    { name: "historySummary", type: "textarea", localized: true },
    { name: "mission", type: "textarea", localized: true },
    { name: "visitorGuidance", type: "textarea", localized: true },
    { name: "safetyNotice", type: "textarea", localized: true },
    { name: "isActive", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
    { name: "isFeatured", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
    { name: "indoorFlow", type: "select", defaultValue: "linear", options: [
      { label: "Linear", value: "linear" },
      { label: "Free Explore", value: "free_explore" },
      { label: "Guided", value: "guided" },
    ]},
    { name: "showOutdoorMap", type: "checkbox", defaultValue: true },
    { name: "outdoorPinsVisibility", type: "select", defaultValue: "always", options: [
      { label: "Always", value: "always" },
      { label: "Nearby", value: "nearby" },
    ]},
    { name: "hideGraphicInKidMode", type: "checkbox", defaultValue: true },
    { name: "replaceRawTestimonies", type: "checkbox", defaultValue: false },
    // Relations
    { name: "location", type: "relationship", relationTo: "locations" },
    { name: "exhibits", type: "relationship", relationTo: "museum-exhibits", hasMany: true },
    { name: "relatedStories", type: "relationship", relationTo: "stories", hasMany: true },
    { name: "relatedRoutes", type: "relationship", relationTo: "routes", hasMany: true },
  ],
};

/**
 * MUSEUM OUTDOOR STOPS (maps: public.museum_outdoor_stops)
 * Separate from route stops — specific to museum grounds.
 */
export const MuseumOutdoorStops: CollectionConfig = {
  slug: "museum-outdoor-stops",
  admin: { useAsTitle: "title", defaultColumns: ["title", "museum", "stopOrder", "isActive"], group: "Places" },
  access: publicReadAdminWrite,
  fields: [
    { name: "museum", type: "relationship", relationTo: "museums", required: true, index: true },
    { name: "title", type: "text", required: true, localized: true },
    { name: "description", type: "textarea", localized: true },
    { name: "latitude", type: "number", required: true },
    { name: "longitude", type: "number", required: true },
    { name: "stopOrder", type: "number", required: true, defaultValue: 1 },
    { name: "contentBlocks", type: "json", defaultValue: [] },
    { name: "autoplayOnArrival", type: "checkbox", defaultValue: false },
    { name: "estimatedTimeMinutes", type: "number", defaultValue: 10 },
    { name: "markerIcon", type: "text", defaultValue: "memorial" },
    { name: "markerColor", type: "text", defaultValue: "#4B5573" },
    { name: "isActive", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};

/**
 * MUSEUM ROOMS (maps: public.museum_rooms)
 * Indoor exhibition rooms — ordered within a museum.
 */
export const MuseumRooms: CollectionConfig = {
  slug: "museum-rooms",
  admin: { useAsTitle: "name", defaultColumns: ["name", "museum", "roomType", "roomOrder"], group: "Places" },
  access: publicReadAdminWrite,
  fields: [
    { name: "museum", type: "relationship", relationTo: "museums", required: true, index: true },
    { name: "name", type: "text", required: true, localized: true },
    { name: "roomType", type: "select", defaultValue: "indoor", options: [
      { label: "Indoor", value: "indoor" },
      { label: "Audio Tour", value: "audio_tour" },
      { label: "Timeline", value: "timeline" },
    ]},
    { name: "introduction", type: "textarea", localized: true },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "roomOrder", type: "number", required: true, defaultValue: 1 },
    { name: "isActive", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};

/**
 * MUSEUM PANELS (maps: public.museum_panels)
 * Individual panels within rooms — contain blocks of content.
 */
export const MuseumPanels: CollectionConfig = {
  slug: "museum-panels",
  admin: { useAsTitle: "title", defaultColumns: ["title", "room", "panelOrder"], group: "Places" },
  access: publicReadAdminWrite,
  fields: [
    { name: "room", type: "relationship", relationTo: "museum-rooms", required: true, index: true },
    { name: "title", type: "text", required: true, localized: true },
    { name: "panelNumber", type: "text" },
    { name: "panelOrder", type: "number", required: true, defaultValue: 1 },
    { name: "notes", type: "textarea" },
    { name: "autoResize", type: "checkbox", defaultValue: true },
    { name: "allowSwipeGallery", type: "checkbox", defaultValue: true },
    { name: "textFlowOptimization", type: "checkbox", defaultValue: true },
    { name: "isActive", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
    // ── Blocks (maps: museum_panel_blocks) embedded ──
    {
      name: "blocks", type: "array",
      fields: [
        { name: "blockType", type: "select", required: true, options: [
          { label: "Text", value: "text" }, { label: "Image", value: "image" },
          { label: "Video", value: "video" }, { label: "Audio", value: "audio" },
          { label: "Quote", value: "quote" }, { label: "Gallery", value: "gallery" },
          { label: "Context", value: "context" },
        ]},
        { name: "blockOrder", type: "number", required: true, defaultValue: 1 },
        { name: "content", type: "json", required: true },
      ],
    },
  ],
};
