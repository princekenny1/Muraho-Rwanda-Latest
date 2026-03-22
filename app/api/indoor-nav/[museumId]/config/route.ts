import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

/**
 * GET /api/indoor-nav/[museumId]/config
 * =======================================
 * Returns everything the mobile app needs for indoor navigation:
 *   - Floor plans with zones
 *   - Beacon positions and identifiers
 *   - Exhibit content linked to each beacon
 *   - Suggested path
 *
 * Called once when visitor enters a museum with indoor nav enabled.
 * Data is cached on the device for offline use.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ museumId: string }> }
) {
  const { museumId } = await params;
  const payload = await getPayload({ config });

  // Fetch museum
  const museum = await payload.findByID({ collection: "museums", id: museumId, depth: 0 });
  if (!(museum as any).hasIndoorNavigation) {
    return NextResponse.json(
      { error: "Indoor navigation not available at this site" },
      { status: 404 }
    );
  }

  // Fetch floor plans
  const floorPlans = await payload.find({
    collection: "floor-plans",
    where: { museum: { equals: museumId } },
    sort: "floorLevel",
    limit: 20,
    depth: 1,
  });

  // Fetch active beacons
  const beacons = await payload.find({
    collection: "beacons",
    where: {
      museum: { equals: museumId },
      beaconStatus: { in: ["active", "low_battery"] },
    },
    limit: 200,
    depth: 1,
  });

  // Fetch exhibits with positions
  const exhibits = await payload.find({
    collection: "museum-exhibits",
    where: { museum: { equals: museumId } },
    sort: "orderIndex",
    limit: 100,
    depth: 1,
  });

  // Build beacon config for the mobile BLE scanner
  const beaconConfig = beacons.docs.map((b: any) => ({
    id: b.id,
    label: b.label,
    protocol: b.beaconProtocol,
    // iBeacon identifiers
    uuid: b.uuid,
    major: b.major,
    minor: b.minor,
    // Eddystone identifiers
    namespace: b.namespace,
    instanceId: b.instanceId,
    // Position
    floorPlanId: b.floorPlan?.id || b.floorPlan,
    floorLevel: b.floorPlan?.floorLevel,
    position: b.positionOnPlan,
    txPower: b.transmitPower || -59,
    // Content trigger
    trigger: {
      action: b.triggerAction,
      radiusMeters: b.triggerRadiusMeters,
      exhibitId: b.triggerExhibit?.id || b.triggerExhibit,
      storyId: b.triggerStory?.id || b.triggerStory,
    },
  }));

  // Build floor plan data
  const floors = floorPlans.docs.map((fp: any) => ({
    id: fp.id,
    name: fp.name,
    floorLevel: fp.floorLevel,
    floorLabel: fp.floorLabel,
    planImageUrl: fp.planImage?.url || fp.planImage?.sizes?.hero?.url,
    dimensions: fp.imageDimensions,
    geoAnchors: fp.geoAnchors,
    zones: fp.zones,
    suggestedPath: fp.suggestedPath,
    beaconCount: beaconConfig.filter(
      (b: any) => b.floorPlanId === fp.id
    ).length,
  }));

  // Build exhibit map (beacon → exhibit content)
  const exhibitMap = exhibits.docs.reduce((map: any, ex: any) => {
    map[ex.id] = {
      id: ex.id,
      title: ex.title,
      type: ex.exhibitType,
      room: ex.room,
      orderIndex: ex.orderIndex,
      description: ex.description,
      image: ex.image?.sizes?.card || ex.image,
      audioGuideUrl: ex.audioGuide?.url,
      audioDuration: ex.audioDurationSeconds,
      position: ex.positionOnFloorPlan,
      floorPlanId: ex.floorPlan?.id || ex.floorPlan,
      sensitivity: ex.sensitivityLevel,
    };
    return map;
  }, {});

  return NextResponse.json({
    museumId,
    museumName: museum.name,
    floors,
    beacons: beaconConfig,
    exhibits: exhibitMap,
    // Shared UUID for iBeacon ranging (same across all beacons in this museum)
    ibeaconUUID: beaconConfig.find((b: any) => b.uuid)?.uuid || null,
    totalBeacons: beaconConfig.length,
    totalExhibits: exhibits.totalDocs,
  });
}
