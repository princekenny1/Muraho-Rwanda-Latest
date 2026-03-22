import type { CollectionConfig } from "payload";
import { publicReadAdminWrite } from "../access";

/**
 * VR SCENES (maps: public.vr_scenes)
 * 360° panorama scenes for virtual museum tours.
 */
export const VRScenes: CollectionConfig = {
  slug: "vr-scenes",
  admin: { useAsTitle: "title", defaultColumns: ["title", "museum", "sceneOrder", "isActive"], group: "Places" },
  access: publicReadAdminWrite,
  fields: [
    { name: "museum", type: "relationship", relationTo: "museums", required: true, index: true },
    { name: "title", type: "text", required: true, localized: true },
    { name: "description", type: "textarea", localized: true },
    { name: "panoramaUrl", type: "text", required: true },
    { name: "panoramaImage", type: "upload", relationTo: "media" },
    { name: "sceneOrder", type: "number", required: true, defaultValue: 1 },
    { name: "narrationText", type: "textarea", localized: true },
    { name: "narrationAudioUrl", type: "text" },
    { name: "isActive", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};

/**
 * VR HOTSPOTS (maps: public.vr_hotspots)
 * Interactive points within VR scenes — info, audio, video, navigation.
 */
export const VRHotspots: CollectionConfig = {
  slug: "vr-hotspots",
  admin: { useAsTitle: "title", defaultColumns: ["title", "scene", "type", "isActive"], group: "Places" },
  access: publicReadAdminWrite,
  fields: [
    { name: "scene", type: "relationship", relationTo: "vr-scenes", required: true, index: true },
    { name: "type", type: "select", required: true, defaultValue: "info", options: [
      { label: "Info", value: "info" },
      { label: "Audio", value: "audio" },
      { label: "Video", value: "video" },
      { label: "Next Scene", value: "next-scene" },
      { label: "Landmark", value: "landmark" },
    ]},
    { name: "title", type: "text", required: true, localized: true },
    { name: "description", type: "textarea", localized: true },
    { name: "positionX", type: "number", required: true, defaultValue: 50, admin: { description: "X position (0-100)" } },
    { name: "positionY", type: "number", required: true, defaultValue: 50, admin: { description: "Y position (0-100)" } },
    { name: "content", type: "json", admin: { description: "Type-specific content (duration, audioUrl, readTime, etc.)" } },
    { name: "targetScene", type: "relationship", relationTo: "vr-scenes", admin: { condition: (d) => d?.type === "next-scene" } },
    { name: "isActive", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};
