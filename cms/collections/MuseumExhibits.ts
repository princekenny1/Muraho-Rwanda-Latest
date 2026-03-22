import type { CollectionConfig } from "payload";
import { publicReadAdminWrite } from "../access";

/**
 * MUSEUM EXHIBITS (maps: exhibitions + exhibition_panels + panel_blocks)
 * Panels and blocks embedded as arrays — frontend uses museum-exhibits slug.
 */
export const MuseumExhibits: CollectionConfig = {
  slug: "museum-exhibits",
  admin: { useAsTitle: "title", defaultColumns: ["title", "isPermanent", "museum", "createdAt"], group: "Places" },
  access: publicReadAdminWrite,
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "description", type: "textarea", localized: true },
    { name: "isPermanent", type: "checkbox", defaultValue: true },
    { name: "imageUrl", type: "text" },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "museum", type: "relationship", relationTo: "museums", index: true },
    // ── Panels (maps: exhibition_panels) ──
    {
      name: "panels", type: "array",
      admin: { description: "Exhibition panels in order" },
      fields: [
        { name: "panelNumber", type: "number", required: true },
        { name: "title", type: "text", required: true, localized: true },
        { name: "sectionLabel", type: "text" },
        { name: "durationMinutes", type: "number", defaultValue: 5 },
        // ── Blocks (maps: panel_blocks) ──
        {
          name: "blocks", type: "array",
          fields: [
            { name: "blockType", type: "select", required: true, options: [
              { label: "Text", value: "text" },
              { label: "Quote", value: "quote" },
              { label: "Video", value: "video" },
              { label: "Audio", value: "audio" },
              { label: "Context", value: "context" },
              { label: "Image", value: "image" },
              { label: "Gallery", value: "gallery" },
            ]},
            { name: "blockOrder", type: "number", required: true },
            { name: "content", type: "json", required: true },
          ],
        },
      ],
    },
  ],
};
