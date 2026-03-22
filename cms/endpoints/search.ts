/**
 * Global Search Endpoint
 * =======================
 * GET /api/search?q=kigali&types=stories,museums&limit=10
 *
 * Searches across: stories, museums, locations, routes, testimonies, documentaries
 * Returns unified results sorted by relevance.
 */

import type { Endpoint } from "payload";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  score: number;
}

const SEARCHABLE_COLLECTIONS = [
  { slug: "stories", titleField: "title", textFields: ["summary", "description"], imageField: "coverImage" },
  { slug: "museums", titleField: "name", textFields: ["description"], imageField: "coverImage" },
  { slug: "locations", titleField: "name", textFields: ["description"], imageField: "coverImage" },
  { slug: "routes", titleField: "title", textFields: ["description"], imageField: "coverImage" },
  { slug: "testimonies", titleField: "title", textFields: ["summary", "biography"], imageField: "thumbnailImage" },
  { slug: "documentaries", titleField: "title", textFields: ["description", "synopsis"], imageField: "coverImage" },
] as const;

export const searchEndpoint: Endpoint = {
  path: "/search",
  method: "get",
  handler: async (req) => {
    const url = new URL(req.url || "", "http://localhost");
    const query = url.searchParams.get("q") || "";
    const typesParam = url.searchParams.get("types");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);

    if (!query || query.length < 2) {
      return Response.json({ results: [], query, total: 0 });
    }

    const allowedTypes = typesParam
      ? typesParam.split(",").map(t => t.trim())
      : SEARCHABLE_COLLECTIONS.map(c => c.slug);

    const collections = SEARCHABLE_COLLECTIONS.filter(c =>
      allowedTypes.includes(c.slug)
    );

    const allResults: SearchResult[] = [];

    // Search each collection in parallel
    const searches = collections.map(async (col) => {
      try {
        // Build OR query across text fields
        const orConditions = [col.titleField, ...col.textFields]
          .map(field => ({ [field]: { contains: query } }));

        const response = await req.payload.find({
          collection: col.slug as any,
          where: { or: orConditions },
          limit: Math.ceil(limit / collections.length) + 2,
          depth: 0,
          sort: "-createdAt",
        });

        for (const doc of response.docs) {
          const title = (doc as any)[col.titleField] || "";
          const slug = (doc as any).slug || doc.id;

          // Extract excerpt from first matching text field
          let excerpt = "";
          for (const field of col.textFields) {
            const val = (doc as any)[field];
            if (val && typeof val === "string") {
              excerpt = val.substring(0, 200);
              break;
            }
          }

          // Simple relevance scoring
          const titleLower = title.toLowerCase();
          const queryLower = query.toLowerCase();
          let score = 0;
          if (titleLower === queryLower) score = 100;
          else if (titleLower.startsWith(queryLower)) score = 80;
          else if (titleLower.includes(queryLower)) score = 60;
          else score = 30; // Matched in body text

          // Resolve image URL
          let imageUrl: string | null = null;
          const imgField = (doc as any)[col.imageField];
          if (imgField) {
            imageUrl = typeof imgField === "string" ? imgField : imgField?.url || null;
          }

          allResults.push({
            id: String(doc.id),
            type: col.slug,
            title,
            slug,
            excerpt,
            imageUrl,
            score,
          });
        }
      } catch (err) {
        // Collection search failed — skip silently
        req.payload.logger.warn(`Search failed for ${col.slug}: ${err}`);
      }
    });

    await Promise.all(searches);

    // Sort by relevance score, then limit
    const sorted = allResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return Response.json({
      results: sorted,
      query,
      total: sorted.length,
      searchedCollections: collections.map(c => c.slug),
    });
  },
};
