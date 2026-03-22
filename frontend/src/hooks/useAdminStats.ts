/**
 * useAdminStats — Fetches real content counts for the admin dashboard.
 *
 * Returns: { stats, isLoading }
 *   stats.stories — total published stories
 *   stats.museums — total active museums
 *   stats.routes — total published routes
 *   stats.testimonies — total testimonies
 *   stats.documentaries — total documentaries
 *   stats.locations — total active locations
 *   stats.users — total registered users
 *   stats.agencies — total active tour agencies
 *   stats.codes — total active access codes
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

interface AdminStats {
  stories: number;
  museums: number;
  routes: number;
  testimonies: number;
  documentaries: number;
  locations: number;
  users: number;
  agencies: number;
  codes: number;
  aiConversations: number;
}

export function useAdminStats() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Fetch counts from all collections in parallel
      const [
        storiesRes,
        museumsRes,
        routesRes,
        testimoniesRes,
        documentariesRes,
        locationsRes,
        usersRes,
        agenciesRes,
        codesRes,
        aiRes,
      ] = await Promise.all([
        api.find("stories", { limit: 0, where: { status: { equals: "published" } } }),
        api.find("museums", { limit: 0, where: { isActive: { equals: true } } }),
        api.find("routes", { limit: 0, where: { status: { equals: "published" } } }),
        api.find("testimonies", { limit: 0 }),
        api.find("documentaries", { limit: 0 }),
        api.find("locations", { limit: 0, where: { isActive: { equals: true } } }),
        api.find("users", { limit: 0 }),
        api.find("tour-agencies", { limit: 0, where: { isActive: { equals: true } } }),
        api.find("access-codes", { limit: 0, where: { isActive: { equals: true } } }),
        api.find("ai-conversations", { limit: 0 }).catch(() => ({ totalDocs: 0 })),
      ]);

      return {
        stories: storiesRes.totalDocs,
        museums: museumsRes.totalDocs,
        routes: routesRes.totalDocs,
        testimonies: testimoniesRes.totalDocs,
        documentaries: documentariesRes.totalDocs,
        locations: locationsRes.totalDocs,
        users: usersRes.totalDocs,
        agencies: agenciesRes.totalDocs,
        codes: codesRes.totalDocs,
        aiConversations: aiRes.totalDocs,
      };
    },
    staleTime: 60_000, // Refresh every minute
    refetchOnWindowFocus: true,
  });

  return {
    stats: stats || {
      stories: 0, museums: 0, routes: 0, testimonies: 0,
      documentaries: 0, locations: 0, users: 0, agencies: 0,
      codes: 0, aiConversations: 0,
    },
    isLoading,
  };
}
