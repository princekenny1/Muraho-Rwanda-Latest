import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { checkContentAccess } from "@/lib/contentAccess";

// GET /api/virtual-tours/[slug]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const payload = await getPayload({ config });
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  const result = await payload.find({
    collection: "virtual-tours",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
    depth: 2,
  });

  if (result.docs.length === 0) {
    return NextResponse.json({ error: "Virtual tour not found" }, { status: 404 });
  }

  const tour = result.docs[0] as any;

  // Check access for premium tours
  let hasFullAccess = tour.accessLevel === "free";
  if (!hasFullAccess && token) {
    try {
      const auth = await payload.verifyToken({ collection: "users", token });
      if (auth.user) {
        const user = await payload.findByID({ collection: "users", id: auth.user.id });
        hasFullAccess = ["subscriber", "agency"].includes((user as any).accessTier);
      }
    } catch { /* anonymous */ }
  }

  // For preview tours, limit panoramas
  let panoramas = tour.panoramas || [];
  if (tour.accessLevel === "preview" && !hasFullAccess) {
    panoramas = panoramas.slice(0, 3); // First 3 only
  } else if (tour.accessLevel === "premium" && !hasFullAccess) {
    // Show tour metadata + first panorama only
    return NextResponse.json({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      description: tour.description,
      heroImage: tour.heroImage,
      museum: tour.museum,
      panoramaCount: tour.panoramaCount,
      estimatedMinutes: tour.estimatedMinutes,
      accessLevel: tour.accessLevel,
      _gated: true,
      panoramas: panoramas.slice(0, 1),
    });
  }

  return NextResponse.json({
    ...tour,
    panoramas,
    _access: { hasFullAccess },
  });
}
