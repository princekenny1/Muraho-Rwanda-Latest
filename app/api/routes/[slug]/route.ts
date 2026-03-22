import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { checkContentAccess, gateContent } from "@/lib/contentAccess";

// GET /api/routes/[slug] — full route with stops
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const payload = await getPayload({ config });
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  const result = await payload.find({
    collection: "routes",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
    depth: 2,
  });

  if (result.docs.length === 0) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  const route = result.docs[0] as any;

  // Check access
  let userId: string | null = null;
  if (token) {
    try {
      const auth = await payload.verifyToken({ collection: "users", token });
      userId = auth.user?.id || null;
    } catch {}
  }

  const { hasFullAccess, accessTier } = await checkContentAccess(
    userId, route.id, "routes", payload
  );

  // Fetch stops with full detail
  let stops = route.stops || [];
  if (Array.isArray(stops) && stops.length > 0 && typeof stops[0] === "string") {
    const stopsResult = await payload.find({
      collection: "route-stops",
      where: { id: { in: stops } },
      sort: "orderIndex",
      depth: 2,
    });
    stops = stopsResult.docs;
  }

  // Gate stops for preview/premium routes
  if (route.accessLevel === "preview" && !hasFullAccess) {
    stops = stops.slice(0, 2); // First 2 stops free
  } else if (route.accessLevel === "premium" && !hasFullAccess) {
    stops = stops.map((s: any, i: number) => ({
      id: s.id,
      name: s.name,
      orderIndex: s.orderIndex,
      stopType: s.stopType,
      location: s.location ? {
        latitude: s.location.latitude,
        longitude: s.location.longitude,
      } : null,
      _gated: i >= 1, // Show first stop only
      ...(i === 0 ? { description: s.description, image: s.image } : {}),
    }));
  }

  return NextResponse.json({
    ...route,
    stops,
    _access: { hasFullAccess, accessTier },
  });
}
