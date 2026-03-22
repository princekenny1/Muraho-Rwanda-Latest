import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

/**
 * POST /api/indoor-nav/[museumId]/position
 * ==========================================
 * Receives visitor position updates from the mobile app's BLE scanner.
 * Writes directly to PostgreSQL (not Payload CMS) for high throughput.
 * Used for visitor flow analytics and heatmaps.
 *
 * Body: {
 *   sessionId: string,
 *   floorLevel: number,
 *   x: number,          // Position on floor plan (0-100%)
 *   y: number,
 *   accuracy: number,   // Estimated accuracy in meters
 *   beaconsInRange: number,
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ museumId: string }> }
) {
  const { museumId } = await params;
  const body = await req.json();
  const { sessionId, floorLevel, x, y, accuracy, beaconsInRange } = body;

  if (!sessionId || x === undefined || y === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await pool.query(
      `INSERT INTO visitor_positions
        (session_id, museum_id, floor_level, x, y, accuracy_m, beacons_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sessionId, museumId, floorLevel || 0, x, y, accuracy, beaconsInRange]
    );

    return NextResponse.json({ recorded: true });
  } catch (error: any) {
    console.error("Position logging error:", error);
    return NextResponse.json({ error: "Failed to record position" }, { status: 500 });
  }
}

/**
 * GET /api/indoor-nav/[museumId]/heatmap
 * ========================================
 * Returns aggregated visitor position data for heatmap visualization.
 * Admin-only endpoint.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ museumId: string }> }
) {
  const { museumId } = await params;
  const { searchParams } = new URL(req.url);
  const floorLevel = parseInt(searchParams.get("floor") || "0");
  const days = parseInt(searchParams.get("days") || "7");

  try {
    // Grid-based aggregation (10x10 grid cells)
    const result = await pool.query(
      `SELECT
        floor_level,
        ROUND(x / 10) * 10 AS grid_x,
        ROUND(y / 10) * 10 AS grid_y,
        COUNT(*) AS visit_count,
        AVG(accuracy_m) AS avg_accuracy
      FROM visitor_positions
      WHERE museum_id = $1
        AND floor_level = $2
        AND recorded_at > NOW() - INTERVAL '${days} days'
      GROUP BY floor_level, grid_x, grid_y
      ORDER BY visit_count DESC`,
      [museumId, floorLevel]
    );

    return NextResponse.json({
      museumId,
      floorLevel,
      periodDays: days,
      grid: result.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch heatmap" }, { status: 500 });
  }
}
