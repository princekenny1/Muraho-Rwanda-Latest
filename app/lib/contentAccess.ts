import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

/**
 * Content Access Middleware
 * =========================
 * Checks if a user can access a piece of content based on:
 *   1. Content's accessLevel (free / preview / premium)
 *   2. User's accessTier (free / day_pass / subscriber / agency)
 *   3. Individual purchases
 *   4. Active access codes
 *
 * Returns full content for authorized users, gated preview for others.
 */
export async function checkContentAccess(
  userId: string | null,
  contentId: string,
  contentType: "stories" | "routes",
  payload: any,
): Promise<{
  hasFullAccess: boolean;
  accessTier: string;
}> {
  if (!userId) return { hasFullAccess: false, accessTier: "free" };

  const user = await payload.findByID({ collection: "users", id: userId });
  const accessTier = user.accessTier || "free";

  // Subscribers and agency members get everything
  if (accessTier === "subscriber" || accessTier === "agency") {
    return { hasFullAccess: true, accessTier };
  }

  // Check individual purchase
  const purchases = await payload.find({
    collection: "payments",
    where: {
      user: { equals: userId },
      status: { equals: "completed" },
      [`purchased${contentType === "stories" ? "Story" : "Route"}`]: { equals: contentId },
    },
    limit: 1,
  });

  if (purchases.docs.length > 0) {
    return { hasFullAccess: true, accessTier };
  }

  // Check active access codes for this specific content
  const now = new Date().toISOString();
  const codes = await payload.find({
    collection: "access-codes",
    where: {
      "redemptions.user": { equals: userId },
      "redemptions.expiresAt": { greater_than: now },
      [`granted${contentType === "stories" ? "Story" : "Route"}`]: { equals: contentId },
    },
    limit: 1,
  });

  if (codes.docs.length > 0) {
    return { hasFullAccess: true, accessTier };
  }

  return { hasFullAccess: false, accessTier };
}

/**
 * Gate content body based on access level.
 * Premium content shows excerpt only for unauthorized users.
 */
export function gateContent(doc: any, hasFullAccess: boolean): any {
  if (doc.accessLevel === "free" || hasFullAccess) {
    return doc;
  }

  // Preview: show excerpt + truncated body
  if (doc.accessLevel === "preview") {
    return {
      ...doc,
      body: truncateRichText(doc.body, 500), // First 500 chars
      audioNarration: undefined,
      audioTestimony: undefined,
      _gated: true,
      _gateReason: "preview",
    };
  }

  // Premium: show metadata only
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    heroImage: doc.heroImage,
    category: doc.category,
    sensitivityLevel: doc.sensitivityLevel,
    accessLevel: doc.accessLevel,
    price: doc.price,
    location: doc.location,
    // Hide full content
    body: undefined,
    audioNarration: undefined,
    audioTestimony: undefined,
    _gated: true,
    _gateReason: "premium",
  };
}

/**
 * Truncate Lexical rich text to approximate character count.
 */
function truncateRichText(richText: any, maxChars: number): any {
  if (!richText?.root?.children) return richText;

  let charCount = 0;
  const truncatedChildren: any[] = [];

  for (const node of richText.root.children) {
    if (charCount >= maxChars) break;
    const nodeText = extractTextLength(node);
    charCount += nodeText;
    truncatedChildren.push(node);
  }

  return {
    root: {
      ...richText.root,
      children: truncatedChildren,
    },
  };
}

function extractTextLength(node: any): number {
  if (node.type === "text") return (node.text || "").length;
  if (node.children) {
    return node.children.reduce((sum: number, child: any) => sum + extractTextLength(child), 0);
  }
  return 0;
}
