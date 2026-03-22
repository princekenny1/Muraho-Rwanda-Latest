import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { checkContentAccess, gateContent } from "@/lib/contentAccess";

// GET /api/stories — list stories with filtering
export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category");
  const sensitivity = searchParams.get("sensitivity");
  const access = searchParams.get("access");
  const search = searchParams.get("search");
  const museumId = searchParams.get("museum");
  const locationId = searchParams.get("location");

  const where: any = { _status: { equals: "published" } };
  if (category) where.category = { equals: category };
  if (sensitivity) where.sensitivityLevel = { equals: sensitivity };
  if (access) where.accessLevel = { equals: access };
  if (museumId) where.relatedMuseum = { equals: museumId };
  if (locationId) where.location = { equals: locationId };
  if (search) where.title = { contains: search };

  const result = await payload.find({
    collection: "stories",
    where,
    page,
    limit,
    sort: "-createdAt",
    depth: 1, // Populate one level of relationships
  });

  // For list views, return card-safe data (no full body)
  const docs = result.docs.map((doc: any) => ({
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    heroImage: doc.heroImage,
    category: doc.category,
    sensitivityLevel: doc.sensitivityLevel,
    accessLevel: doc.accessLevel,
    price: doc.price,
    location: doc.location ? {
      id: doc.location.id,
      name: doc.location.name,
      latitude: doc.location.latitude,
      longitude: doc.location.longitude,
    } : null,
    createdAt: doc.createdAt,
  }));

  return NextResponse.json({
    docs,
    totalDocs: result.totalDocs,
    page: result.page,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  });
}
