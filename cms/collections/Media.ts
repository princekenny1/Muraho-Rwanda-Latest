import type { CollectionConfig } from "payload";
import { publicRead, isAdmin } from "../access";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "video/*", "application/pdf"],
    // ── Security: file size limits ──
    filesRequiredOnCreate: true,
    // Payload 3 uses imageSizes for auto-resize
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 768, height: 512, position: "centre" },
      { name: "hero", width: 1920, height: 1080, position: "centre" },
    ],
  },
  admin: { useAsTitle: "alt", group: "Media" },
  access: { read: publicRead, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: "alt", type: "text", required: true },
    { name: "caption", type: "text", localized: true },
  ],
};

export const AudioFiles: CollectionConfig = {
  slug: "audio-files",
  upload: {
    staticDir: "audio",
    mimeTypes: ["audio/*"],
  },
  admin: { useAsTitle: "title", group: "Media" },
  access: { read: publicRead, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "durationSeconds", type: "number" },
    { name: "language", type: "select", options: [{ label: "English", value: "en" }, { label: "Français", value: "fr" }, { label: "Ikinyarwanda", value: "rw" }] },
    { name: "narrator", type: "text" },
  ],
};
