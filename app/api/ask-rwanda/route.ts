import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";

/**
 * POST /api/ask-rwanda
 * =====================
 * Proxy to the AI FastAPI microservice.
 * Adds user context (access tier, language) before forwarding.
 * Enforces rate limits based on access tier.
 * Supports streaming (SSE) responses.
 */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  // Get user context
  let userId: string | null = null;
  let accessTier = "free";
  let language = "en";

  if (token) {
    try {
      const auth = await payload.verifyToken({ collection: "users", token });
      if (auth.user) {
        userId = auth.user.id;
        accessTier = (auth.user as any).accessTier || "free";
        language = (auth.user as any).preferredLanguage || "en";
      }
    } catch { /* anonymous */ }
  }

  // Rate limit check (via AI settings)
  const aiSettings = await payload.findGlobal({ slug: "ai-settings" });
  const rateLimits = (aiSettings as any).rateLimits || {};
  const maxQueries: Record<string, number> = {
    free: rateLimits.freeQueriesPerDay || 5,
    day_pass: rateLimits.subscriberQueriesPerDay || 100,
    subscriber: rateLimits.subscriberQueriesPerDay || 100,
    agency: rateLimits.agencyQueriesPerDay || 500,
  };

  if (userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayQueries = await payload.find({
      collection: "ai-conversations",
      where: {
        user: { equals: userId },
        createdAt: { greater_than: today.toISOString() },
      },
      limit: 0, // count only
    });

    if (todayQueries.totalDocs >= (maxQueries[accessTier] || 5)) {
      return NextResponse.json(
        {
          error: "Daily limit reached",
          message: `You've used all ${maxQueries[accessTier]} questions for today.${
            accessTier === "free" ? " Subscribe for 100 questions per day!" : ""
          }`,
          limit: maxQueries[accessTier],
          used: todayQueries.totalDocs,
        },
        { status: 429 }
      );
    }
  }

  const body = await req.json();
  const { query, mode, context, stream } = body;

  // Forward to AI service
  const aiRequest = {
    query,
    language: body.language || language,
    mode: mode || "standard",
    context: context || {},
    access_tier: accessTier,
    stream: stream || false,
  };

  try {
    if (stream) {
      // Streaming SSE response
      const aiResponse = await fetch(`${AI_SERVICE_URL}/api/v1/ask-rwanda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiRequest),
      });

      if (!aiResponse.ok) {
        const error = await aiResponse.json();
        return NextResponse.json(error, { status: aiResponse.status });
      }

      // Pass through the SSE stream
      return new NextResponse(aiResponse.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Standard JSON response
      const aiResponse = await fetch(`${AI_SERVICE_URL}/api/v1/ask-rwanda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiRequest),
      });

      const result = await aiResponse.json();

      // Log the conversation
      if (userId) {
        await payload.create({
          collection: "ai-conversations",
          data: {
            user: userId,
            query,
            response: result.answer,
            mode: aiRequest.mode,
            modelUsed: result.model_used,
            languageDetected: result.language,
            sourcesUsed: result.sources,
            processingMs: result.processing_ms,
            safetyFlagged: result.safety_filtered || false,
            context: aiRequest.context,
          },
        });
      }

      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error("AI service error:", error);
    return NextResponse.json(
      { error: "AI service unavailable", message: "Please try again in a moment." },
      { status: 503 }
    );
  }
}
