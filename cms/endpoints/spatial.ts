/**
 * /api/spatial/* — Map & Geospatial Queries
 * Backend: PostGIS + Payload collections with lat/lng fields
 *
 * Endpoints:
 *   POST /api/spatial/nearby   — Points within radius of lat/lng
 *   POST /api/spatial/bbox     — Points within bounding box (map viewport)
 *   POST /api/spatial/layers   — Aggregated map layers (museums + stories + routes)
 *   GET  /api/spatial/route/:id — Route GeoJSON with stops
 */
import type { PayloadHandler } from "payload";

// ── Rwanda bounds (for validation) ───────────────────────
const RWANDA_BOUNDS = {
  minLat: -2.9,
  maxLat: -1.0,
  minLng: 28.8,
  maxLng: 30.9,
};

function validateCoords(lat: number, lng: number): boolean {
  return (
    lat >= RWANDA_BOUNDS.minLat &&
    lat <= RWANDA_BOUNDS.maxLat &&
    lng >= RWANDA_BOUNDS.minLng &&
    lng <= RWANDA_BOUNDS.maxLng
  );
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface SpatialPoint {
  id: string;
  type: "museum" | "location" | "route_stop" | "outdoor_stop" | "story";
  title: string;
  latitude: number;
  longitude: number;
  icon?: string;
  color?: string;
  slug?: string;
  category?: string;
  imageUrl?: string;
  distanceKm?: number;
}

/** Fetch all spatial points from Payload collections */
async function fetchAllPoints(payload: any): Promise<SpatialPoint[]> {
  const points: SpatialPoint[] = [];

  // Museums
  const museums = await payload.find({
    collection: "museums",
    limit: 200,
    where: { isActive: { equals: true } },
  });
  for (const m of museums.docs) {
    if (m.latitude && m.longitude) {
      points.push({
        id: m.id,
        type: "museum",
        title: m.name,
        latitude: m.latitude,
        longitude: m.longitude,
        slug: m.slug,
        icon: "museum",
        color: "#7C3AED",
        imageUrl:
          m.coverImage ||
          (typeof m.heroImage === "object" ? m.heroImage?.url : null),
      });
    }
  }

  // Locations
  const locations = await payload.find({
    collection: "locations",
    limit: 500,
    where: { isActive: { equals: true } },
  });
  for (const loc of locations.docs) {
    if (loc.latitude && loc.longitude) {
      points.push({
        id: loc.id,
        type: "location",
        title: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        slug: loc.slug,
        category: loc.locationType,
        icon: loc.locationType || "location",
        color: "#059669",
        imageUrl:
          typeof loc.coverImage === "object" ? loc.coverImage?.url : null,
      });
    }
  }

  // Route stops
  const stops = await payload.find({ collection: "route-stops", limit: 500 });
  for (const stop of stops.docs) {
    if (stop.latitude && stop.longitude) {
      points.push({
        id: stop.id,
        type: "route_stop",
        title: stop.title,
        latitude: stop.latitude,
        longitude: stop.longitude,
        icon: stop.markerIcon || "location",
        color: stop.markerColor || "#F97316",
      });
    }
  }

  // Museum outdoor stops
  const outdoors = await payload.find({
    collection: "museum-outdoor-stops",
    limit: 300,
    where: { isActive: { equals: true } },
  });
  for (const os of outdoors.docs) {
    if (os.latitude && os.longitude) {
      points.push({
        id: os.id,
        type: "outdoor_stop",
        title: os.title,
        latitude: os.latitude,
        longitude: os.longitude,
        icon: os.markerIcon || "memorial",
        color: os.markerColor || "#4B5573",
      });
    }
  }

  return points;
}

/** POST /api/spatial/nearby — Points within radius */
export const spatialNearby: PayloadHandler = async (req) => {
  try {
    const body = (await (req as any).json?.()) || (req as any).body || {};
    const { latitude, longitude, radiusKm = 5, types } = body;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return Response.json(
        { error: "latitude and longitude required" },
        { status: 400 },
      );
    }
    if (!validateCoords(latitude, longitude)) {
      return Response.json(
        { error: "coordinates out of Rwanda bounds" },
        { status: 400 },
      );
    }

    const allPoints = await fetchAllPoints(req.payload);

    let results = allPoints
      .map((p) => ({
        ...p,
        distanceKm: haversineKm(latitude, longitude, p.latitude, p.longitude),
      }))
      .filter((p) => p.distanceKm <= radiusKm);

    if (types?.length) {
      results = results.filter((p) => types.includes(p.type));
    }

    results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    return Response.json({
      center: { latitude, longitude },
      radiusKm,
      count: results.length,
      points: results,
    });
  } catch (err: any) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
};

/** POST /api/spatial/bbox — Points within map viewport bounding box */
export const spatialBbox: PayloadHandler = async (req) => {
  try {
    const body = (await (req as any).json?.()) || (req as any).body || {};
    const { north, south, east, west, types } = body;
    if (
      typeof north !== "number" ||
      typeof south !== "number" ||
      typeof east !== "number" ||
      typeof west !== "number"
    ) {
      return Response.json(
        { error: "north, south, east, west bounds required" },
        { status: 400 },
      );
    }

    const allPoints = await fetchAllPoints(req.payload);

    let results = allPoints.filter(
      (p) =>
        p.latitude >= south &&
        p.latitude <= north &&
        p.longitude >= west &&
        p.longitude <= east,
    );

    if (types?.length) {
      results = results.filter((p) => types.includes(p.type));
    }

    return Response.json({
      bounds: { north, south, east, west },
      count: results.length,
      points: results,
    });
  } catch (err: any) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
};

/** POST /api/spatial/layers — Aggregated map layers grouped by type */
export const spatialLayers: PayloadHandler = async (req) => {
  try {
    const body = (await (req as any).json?.()) || (req as any).body || {};
    const { types, center, radiusKm } = body;
    const allPoints = await fetchAllPoints(req.payload);

    let filtered = allPoints;
    if (center && radiusKm) {
      filtered = allPoints
        .map((p) => ({
          ...p,
          distanceKm: haversineKm(
            center.latitude,
            center.longitude,
            p.latitude,
            p.longitude,
          ),
        }))
        .filter((p) => (p.distanceKm || 0) <= radiusKm);
    }
    if (types?.length) {
      filtered = filtered.filter((p) => types.includes(p.type));
    }

    // Group by type
    const layers: Record<string, SpatialPoint[]> = {};
    for (const p of filtered) {
      if (!layers[p.type]) layers[p.type] = [];
      layers[p.type].push(p);
    }

    // Get route lines
    const routes = await req.payload.find({
      collection: "routes",
      limit: 50,
      where: { status: { equals: "published" } },
    });
    const routeLines = routes.docs
      .filter((r: any) => r.routePath)
      .map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        difficulty: r.difficulty,
        path: r.routePath,
      }));

    return Response.json({
      layers,
      routeLines,
      totalPoints: filtered.length,
    });
  } catch (err: any) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
};

/** GET /api/spatial/route/:id — Route GeoJSON with stops */
export const spatialRoute: PayloadHandler = async (req) => {
  try {
    const routeId =
      ((req as any).query?.id as string) || (req as any).params?.id;
    if (!routeId)
      return Response.json({ error: "route id required" }, { status: 400 });

    let route: any;
    try {
      route = await req.payload.findByID({
        collection: "routes",
        id: routeId,
        depth: 0,
      });
    } catch (err: any) {
      const msg = String(err?.message || "").toLowerCase();
      if (msg.includes("not found")) {
        return Response.json({ error: "route not found" }, { status: 404 });
      }
      if (
        msg.includes("invalid") ||
        msg.includes("syntax") ||
        msg.includes("uuid")
      ) {
        return Response.json({ error: "invalid route id" }, { status: 400 });
      }
      throw err;
    }

    if (!route) {
      return Response.json({ error: "route not found" }, { status: 404 });
    }

    const stops = await req.payload.find({
      collection: "route-stops",
      where: { route: { equals: routeId } },
      sort: "stopOrder",
      limit: 100,
    });

    // Build GeoJSON FeatureCollection
    const features: any[] = [];

    // Route line
    if (route.routePath) {
      features.push({
        type: "Feature",
        geometry: route.routePath,
        properties: {
          id: route.id,
          type: "route_line",
          title: route.title,
          difficulty: route.difficulty,
          slug: route.slug,
        },
      });
    }

    // Stops as points
    for (const stop of stops.docs) {
      if (stop.latitude && stop.longitude) {
        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [stop.longitude, stop.latitude],
          },
          properties: {
            id: stop.id,
            type: "route_stop",
            title: stop.title,
            stopOrder: stop.stopOrder,
            icon: stop.markerIcon,
            color: stop.markerColor,
            estimatedTime: stop.estimatedTimeMinutes,
          },
        });
      }
    }

    return Response.json({
      type: "FeatureCollection",
      features,
      properties: {
        routeId: route.id,
        title: route.title,
        slug: route.slug,
        difficulty: route.difficulty,
        durationMinutes: route.durationMinutes,
        distanceKm: route.distanceKm,
        stopsCount: stops.docs.length,
      },
    });
  } catch (err: any) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
};
