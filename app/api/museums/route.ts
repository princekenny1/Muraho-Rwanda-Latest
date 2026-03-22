import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

// GET /api/museums — list all museums
export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const province = searchParams.get("province");
  const hasVirtualTour = searchParams.get("hasVirtualTour");
  const hasIndoorNav = searchParams.get("hasIndoorNav");
  const hasAR = searchParams.get("hasAR");

  const where: any = { _status: { equals: "published" } };
  if (type) where.type = { equals: type };
  if (province) where.province = { equals: province };
  if (hasIndoorNav === "true") where.hasIndoorNavigation = { equals: true };
  if (hasVirtualTour === "true") where.virtualTour = { exists: true };
  if (hasAR === "true") where.arExperience = { exists: true };

  const result = await payload.find({
    collection: "museums",
    where,
    sort: "name",
    depth: 1,
    limit: 50,
  });

  const docs = result.docs.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    type: doc.type,
    shortDescription: doc.shortDescription,
    heroImage: doc.heroImage,
    city: doc.city,
    province: doc.province,
    location: doc.location ? {
      latitude: doc.location.latitude,
      longitude: doc.location.longitude,
    } : null,
    sensitivityLevel: doc.sensitivityLevel,
    // Spatial experience flags
    hasIndoorNavigation: doc.hasIndoorNavigation,
    hasVirtualTour: !!doc.virtualTour,
    hasAR: !!doc.arExperience,
    visitInfo: doc.visitInfo,
  }));

  return NextResponse.json({ docs, totalDocs: result.totalDocs });
}
