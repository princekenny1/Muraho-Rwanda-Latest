import type { CollectionConfig } from "payload";
import { publicReadEditorWrite } from "../access";
import { autoSlug } from "../hooks";

export const Testimonies: CollectionConfig = {
  slug: "testimonies",
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "personName",
      "category",
      "isFeatured",
      "updatedAt",
    ],
    group: "Content",
    description: "Survivor testimonies — handle with extreme care and dignity.",
  },
  access: publicReadEditorWrite,
  versions: { drafts: true },
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "personName", type: "text", required: true },
    {
      name: "context",
      type: "text",
      required: true,
      admin: { description: 'e.g. "April 1994 · Kigali · Survivor"' },
    },
    { name: "coverImage", type: "text" },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "hasContentWarning", type: "checkbox", defaultValue: true },
    { name: "videoUrl", type: "text" },
    {
      name: "audioUrl",
      type: "text",
      admin: { description: "Audio-only testimony URL (external link)" },
    },
    {
      name: "audioFile",
      type: "upload",
      relationTo: "audio-files",
      admin: { description: "Uploaded audio file (takes priority over URL)" },
    },
    { name: "captionsUrl", type: "text" },
    {
      name: "transcriptSegments",
      type: "json",
      defaultValue: [],
      admin: { description: "Array of {time, text, isPullQuote?, speaker?}" },
    },
    {
      name: "sources",
      type: "json",
      defaultValue: [],
      admin: { description: "Array of {name, url?}" },
    },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "survivor",
      options: [
        { label: "Survivor", value: "survivor" },
        { label: "Rescuer", value: "rescuer" },
        { label: "Witness", value: "witness" },
        { label: "Reconciliation", value: "reconciliation" },
      ],
    },
    {
      name: "location",
      type: "text",
      admin: { description: "Location text for filtering" },
    },
    { name: "locationRef", type: "relationship", relationTo: "locations" },
    { name: "year", type: "number" },
    { name: "durationMinutes", type: "number", defaultValue: 10 },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    // ── Consent ──
    {
      name: "consentStatus",
      type: "select",
      defaultValue: "full",
      options: [
        { label: "Full Consent", value: "full" },
        { label: "Partial (text only)", value: "partial_text" },
        { label: "Partial (audio only)", value: "partial_audio" },
        { label: "Pending", value: "pending" },
        { label: "Withdrawn", value: "withdrawn" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "sensitivityLevel",
      type: "select",
      defaultValue: "highly_sensitive",
      options: [
        { label: "Sensitive", value: "sensitive" },
        { label: "Highly Sensitive", value: "highly_sensitive" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
