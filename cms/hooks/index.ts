import type { CollectionBeforeValidateHook } from "payload";

/**
 * autoSlug — Generates URL-safe slug from title/name if not provided.
 */
export const autoSlug: CollectionBeforeValidateHook = async ({ data }) => {
  if (data && !data.slug && (data.title || data.name)) {
    data.slug = (data.title || data.name)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 100);
  }
  return data;
};
