import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { checkContentAccess, gateContent } from "@/lib/contentAccess";

// GET /api/routes — list routes
export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");

  const where: any = { _status: { equals: "published" } };
  if (category) where.category = { equals: category };
  if (difficulty) where.difficulty = { equals: difficulty };

  const result = await payload.find({
    collection: "routes",
    where,
    sort: "name",
    limit: 50,
    depth: 1,
  });

  const docs = result.docs.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    heroImage: doc.heroImage,
    difficulty: doc.difficulty,
    estimatedHours: doc.estimatedHours,
    distanceKm: doc.distanceKm,
    transportMode: doc.transportMode,
    stopCount: doc.stops?.length || 0,
    category: doc.category,
    accessLevel: doc.accessLevel,
    price: doc.price,
    offlineAvailable: doc.offlineAvailable,
  }));

  return NextResponse.json({ docs, totalDocs: result.totalDocs });
}
