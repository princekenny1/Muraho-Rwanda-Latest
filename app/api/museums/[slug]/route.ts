import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

// GET /api/museums/[slug] — full museum with spatial data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "museums",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
    depth: 2,
  });

  if (result.docs.length === 0) {
    return NextResponse.json({ error: "Museum not found" }, { status: 404 });
  }

  const museum = result.docs[0] as any;

  // Fetch exhibits sorted by order
  const exhibits = await payload.find({
    collection: "museum-exhibits",
    where: { museum: { equals: museum.id } },
    sort: "orderIndex",
    limit: 100,
    depth: 1,
  });

  // Fetch beacons if indoor nav is enabled
  let beacons: any = null;
  if (museum.hasIndoorNavigation) {
    beacons = await payload.find({
      collection: "beacons",
      where: {
        museum: { equals: museum.id },
        beaconStatus: { equals: "active" },
      },
      limit: 200,
    });
  }

  return NextResponse.json({
    ...museum,
    exhibits: exhibits.docs,
    beacons: beacons?.docs || [],
  });
}
