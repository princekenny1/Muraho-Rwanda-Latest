import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

/**
 * GET /api/map/features
 * =======================
 * Returns GeoJSON FeatureCollection for the map.
 * Combines locations from all sources: museums, route stops, landmarks.
 * Supports layer filtering for the frontend map control panel.
 *
 * Query params:
 *   - layers: comma-separated (museums,routes,landmarks,memorials)
 *   - bounds: sw_lat,sw_lng,ne_lat,ne_lng (viewport filtering)
 *   - sensitivity: max sensitivity level to show
 */
export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });
  const { searchParams } = new URL(req.url);

  const layers = searchParams.get("layers")?.split(",") || ["all"];
  const sensitivity = searchParams.get("sensitivity") || "highly_sensitive";

  const where: any = {};

  // Filter by location type
  if (!layers.includes("all")) {
    const typeMap: Record<string, string[]> = {
      museums: ["museum"],
      memorials: ["museum"],
      routes: ["route_stop"],
      landmarks: ["landmark", "viewpoint"],
      cultural: ["cultural_site"],
      parks: ["national_park"],
    };
    const types = layers.flatMap((l) => typeMap[l] || [l]);
    if (types.length > 0) {
      where.locationType = { in: types };
    }
  }

  // Filter by sensitivity
  const sensitivityLevels: Record<string, string[]> = {
    standard: ["standard"],
    sensitive: ["standard", "sensitive"],
    highly_sensitive: ["standard", "sensitive", "highly_sensitive"],
  };
  where.sensitivityLevel = { in: sensitivityLevels[sensitivity] || sensitivityLevels.highly_sensitive };

  const locations = await payload.find({
    collection: "locations",
    where,
    limit: 500,
    depth: 0,
  });

  // Build GeoJSON
  const features = locations.docs
    .filter((loc: any) => loc.latitude && loc.longitude)
    .map((loc: any) => ({
      type: "Feature" as const,
      id: loc.id,
      geometry: {
        type: "Point" as const,
        coordinates: [loc.longitude, loc.latitude],
      },
      properties: {
        name: typeof loc.name === "object" ? loc.name.en || Object.values(loc.name)[0] : loc.name,
        type: loc.locationType,
        icon: loc.mapIcon || "default",
        sensitivity: loc.sensitivityLevel,
        slug: loc.slug,
        address: loc.address,
      },
    }));

  return NextResponse.json({
    type: "FeatureCollection",
    features,
  });
}

/**
 * GET /api/map/route-path/[routeId]
 * ====================================
 * Returns the GeoJSON LineString for a specific route.
 */
