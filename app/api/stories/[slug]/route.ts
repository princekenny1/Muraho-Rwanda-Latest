import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { checkContentAccess, gateContent } from "@/lib/contentAccess";

// GET /api/stories/[slug] — get single story with access control
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const payload = await getPayload({ config });
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  const result = await payload.find({
    collection: "stories",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
    depth: 2,
  });

  if (result.docs.length === 0) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const story = result.docs[0] as any;

  // Check access
  let userId: string | null = null;
  if (token) {
    try {
      const auth = await payload.verifyToken({ collection: "users", token });
      userId = auth.user?.id || null;
    } catch { /* anonymous */ }
  }

  const { hasFullAccess, accessTier } = await checkContentAccess(
    userId, story.id, "stories", payload
  );

  const gated = gateContent(story, hasFullAccess);

  return NextResponse.json({
    ...gated,
    _access: { hasFullAccess, accessTier },
  });
}
