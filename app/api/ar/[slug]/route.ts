import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

/**
 * GET /api/ar/[slug]
 * ====================
 * Returns AR experience config with all anchors.
 * Mobile app uses this to initialize the AR session.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "ar-experiences",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
    depth: 2,
  });

  if (result.docs.length === 0) {
    return NextResponse.json({ error: "AR experience not found" }, { status: 404 });
  }

  const experience = result.docs[0] as any;

  // Build optimized anchor data for the AR renderer
  const anchors = (experience.anchors || []).map((anchor: any) => ({
    id: anchor.id,
    label: anchor.label,
    anchorType: anchor.anchorType,
    contentType: anchor.contentType,
    interactionType: anchor.interactionType,
    sensitivity: anchor.sensitivityLevel,

    // Anchor position data (varies by type)
    ...(anchor.anchorType === "image_marker" && {
      markerImageUrl: anchor.markerImage?.url || anchor.markerImage?.sizes?.card?.url,
      markerWidthMeters: anchor.markerWidthMeters,
    }),
    ...(anchor.anchorType === "gps" && {
      gps: anchor.gpsPosition,
    }),
    ...(anchor.anchorType === "spatial" && {
      spatial: anchor.spatialPosition,
    }),

    // Content payload
    title: anchor.overlayTitle,
    text: anchor.overlayText,
    imageUrl: anchor.overlayImage?.url,
    imageOpacity: anchor.overlayImageOpacity,
    modelUrl: anchor.modelUrl,
    modelScale: anchor.modelScale,
    audioUrl: anchor.audioFile?.url,
    autoPlayAudio: anchor.autoPlayAudio,

    // Proximity trigger
    ...(anchor.interactionType === "proximity" && {
      proximityMeters: anchor.proximityMeters,
    }),

    // Deep links to content
    linkedStory: anchor.linkedStory ? {
      id: anchor.linkedStory.id,
      title: anchor.linkedStory.title,
      slug: anchor.linkedStory.slug,
    } : null,
    linkedExhibit: anchor.linkedExhibit ? {
      id: anchor.linkedExhibit.id,
      title: anchor.linkedExhibit.title,
    } : null,
  }));

  return NextResponse.json({
    id: experience.id,
    title: experience.title,
    slug: experience.slug,
    arType: experience.arType,
    description: experience.description,
    instructions: experience.instructions,
    instructionImageUrl: experience.instructionImage?.url,
    museum: {
      id: experience.museum?.id,
      name: experience.museum?.name,
      slug: experience.museum?.slug,
    },
    requirements: experience.requirements,
    accessLevel: experience.accessLevel,
    sensitivityLevel: experience.sensitivityLevel,
    contentWarning: experience.contentWarning,
    anchors,
    anchorCount: anchors.length,
  });
}

/**
 * POST /api/ar/[slug]/session
 * =============================
 * Logs AR session analytics.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // This would be under /api/ar/[slug]/session/route.ts in practice
  // Included here for completeness
  const { slug } = await params;
  const body = await req.json();
  const {
    sessionId, userId, museumId, anchorsTriggered,
    totalTimeSec, deviceModel, arFramework,
  } = body;

  try {
    await pool.query(
      `INSERT INTO ar_sessions
        (experience_id, user_id, session_id, museum_id, anchors_triggered, total_time_sec, device_model, ar_framework, ended_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [slug, userId, sessionId, museumId, anchorsTriggered || [], totalTimeSec, deviceModel, arFramework]
    );

    return NextResponse.json({ recorded: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to log AR session" }, { status: 500 });
  }
}
