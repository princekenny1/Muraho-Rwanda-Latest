import type { CollectionConfig } from "payload";
import { ownerAccess } from "../access";

const contentTypeOptions = [
  { label: "Story", value: "story" },
  { label: "Route", value: "route" },
  { label: "Testimony", value: "testimony" },
  { label: "Documentary", value: "documentary" },
];

// ── USER SETTINGS (maps: public.user_settings) ──────────
export const UserSettings: CollectionConfig = {
  slug: "user-settings",
  admin: { useAsTitle: "user", defaultColumns: ["user", "theme", "language", "updatedAt"], group: "User Data" },
  access: ownerAccess,
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true, unique: true, index: true },
    { name: "theme", type: "select", defaultValue: "system", options: [
      { label: "System", value: "system" }, { label: "Light", value: "light" }, { label: "Dark", value: "dark" },
    ]},
    { name: "language", type: "select", defaultValue: "en", options: [
      { label: "English", value: "en" }, { label: "Français", value: "fr" }, { label: "Ikinyarwanda", value: "rw" },
    ]},
    { name: "storyAlerts", type: "checkbox", defaultValue: true },
    { name: "locationBased", type: "checkbox", defaultValue: true },
    { name: "emailDigest", type: "checkbox", defaultValue: false },
    { name: "soundEnabled", type: "checkbox", defaultValue: true },
  ],
};

// ── USER SAVED ITEMS (maps: public.user_saved_items) ─────
export const UserSavedItems: CollectionConfig = {
  slug: "user-saved-items",
  admin: { useAsTitle: "title", defaultColumns: ["user", "contentType", "title", "createdAt"], group: "User Data" },
  access: ownerAccess,
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "contentId", type: "text", required: true },
    { name: "contentType", type: "select", required: true, options: contentTypeOptions },
    { name: "title", type: "text", required: true },
    { name: "imageUrl", type: "text" },
  ],
};

// ── USER PROGRESS (maps: public.user_progress) ──────────
export const UserProgress: CollectionConfig = {
  slug: "user-progress",
  admin: { useAsTitle: "title", defaultColumns: ["user", "contentType", "title", "progressPercent", "updatedAt"], group: "User Data" },
  access: ownerAccess,
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "contentId", type: "text", required: true },
    { name: "contentType", type: "select", required: true, options: contentTypeOptions },
    { name: "title", type: "text", required: true },
    { name: "imageUrl", type: "text" },
    { name: "progressPercent", type: "number", required: true, defaultValue: 0, min: 0, max: 100 },
    { name: "lastPositionSeconds", type: "number", defaultValue: 0 },
  ],
};

// ── USER DOWNLOADS (maps: public.user_downloads) ─────────
export const UserDownloads: CollectionConfig = {
  slug: "user-downloads",
  admin: { useAsTitle: "title", defaultColumns: ["user", "contentType", "title", "downloadSizeMb", "createdAt"], group: "User Data" },
  access: ownerAccess,
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "contentId", type: "text", required: true },
    { name: "contentType", type: "select", required: true, options: contentTypeOptions },
    { name: "title", type: "text", required: true },
    { name: "imageUrl", type: "text" },
    { name: "downloadSizeMb", type: "number" },
    { name: "downloadedAt", type: "date", required: true },
  ],
};
