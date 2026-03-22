import type { CollectionConfig } from "payload";
import { publicReadAdminWrite, publicRead, isAdmin } from "../access";
import { autoSlug } from "../hooks";

/**
 * DOCUMENTARIES (maps: public.documentaries)
 * Chapters + transcripts embedded as arrays (not separate tables)
 * since Payload handles nested data well and avoids extra queries.
 */
export const Documentaries: CollectionConfig = {
  slug: "documentaries",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "year", "isFeatured", "updatedAt"],
    group: "Content",
  },
  access: publicReadAdminWrite,
  versions: { drafts: true },
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "synopsis", type: "textarea", required: true, localized: true },
    { name: "coverImage", type: "text" },
    { name: "heroImage", type: "upload", relationTo: "media" },
    {
      name: "runtime",
      type: "number",
      required: true,
      admin: { description: "Runtime in minutes" },
    },
    { name: "year", type: "number", required: true },
    { name: "director", type: "text" },
    {
      name: "type",
      type: "select",
      defaultValue: "historical",
      options: [
        { label: "Historical", value: "historical" },
        { label: "Survivor Stories", value: "survivor-stories" },
        { label: "Cultural", value: "cultural" },
        { label: "Educational", value: "educational" },
      ],
    },
    { name: "isNew", type: "checkbox", defaultValue: false },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    { name: "videoUrl", type: "text" },
    { name: "trailerUrl", type: "text" },
    // ── Chapters (maps: public.documentary_chapters) ──
    {
      name: "chapters",
      type: "array",
      admin: { description: "Film chapters in order" },
      fields: [
        { name: "chapterNumber", type: "number", required: true },
        { name: "title", type: "text", required: true, localized: true },
        {
          name: "duration",
          type: "number",
          required: true,
          admin: { description: "Duration in seconds" },
        },
        {
          name: "type",
          type: "select",
          defaultValue: "narrative",
          options: [
            { label: "Narrative", value: "narrative" },
            { label: "Interview", value: "interview" },
            { label: "Documentary", value: "documentary" },
          ],
        },
        // ── Transcripts embedded per chapter (maps: public.documentary_transcripts) ──
        {
          name: "transcripts",
          type: "array",
          fields: [
            { name: "startTime", type: "number", required: true },
            { name: "endTime", type: "number", required: true },
            { name: "text", type: "textarea", required: true, localized: true },
            { name: "speaker", type: "text" },
          ],
        },
      ],
    },
    // ── Supplementary ──
    {
      name: "photos",
      type: "array",
      admin: { description: "Supplementary photo gallery" },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text", localized: true },
        { name: "year", type: "number" },
      ],
    },
    {
      name: "essays",
      type: "array",
      admin: { description: "Companion essays / further reading" },
      fields: [
        { name: "title", type: "text", required: true, localized: true },
        { name: "author", type: "text", required: true },
        { name: "excerpt", type: "textarea", localized: true },
        { name: "url", type: "text" },
      ],
    },
    {
      name: "sources",
      type: "array",
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "type",
          type: "text",
          admin: {
            description: 'e.g. "Digital Archive", "Official Documents"',
          },
        },
        { name: "institution", type: "text" },
        { name: "url", type: "text" },
      ],
    },
    {
      name: "downloads",
      type: "array",
      admin: { description: "Downloadable assets (transcripts, study guides)" },
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "type",
          type: "select",
          options: [
            { label: "Transcript", value: "transcript" },
            { label: "Photos", value: "photos" },
            { label: "Study Guide", value: "study-guide" },
            { label: "Other", value: "other" },
          ],
        },
        { name: "file", type: "upload", relationTo: "media" },
        { name: "size", type: "text", admin: { description: 'e.g. "2.4 MB"' } },
      ],
    },
    // ── Access ──
    {
      name: "sensitivityLevel",
      type: "select",
      defaultValue: "sensitive",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Sensitive", value: "sensitive" },
        { label: "Highly Sensitive", value: "highly_sensitive" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "contentWarning", type: "textarea", localized: true },
    // ── Relations ──
    { name: "location", type: "relationship", relationTo: "locations" },
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
