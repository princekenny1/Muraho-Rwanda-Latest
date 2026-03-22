/**
 * Auth API Routes — /api/auth/*
 * ===============================
 * Payload CMS handles auth natively. These routes wrap Payload's
 * auth operations for the frontend's useAuth() hook.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

// POST /api/auth/register
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const body = await req.json();
  const { email, password, fullName, preferredLanguage } = body;

  try {
    const user = await payload.create({
      collection: "users",
      data: {
        email,
        password,
        fullName,
        preferredLanguage: preferredLanguage || "en",
        role: "visitor",
        accessTier: "free",
      },
    });

    // Auto-login after registration
    const loginResult = await payload.login({
      collection: "users",
      data: { email, password },
    });

    return NextResponse.json({
      user: sanitizeUser(loginResult.user),
      token: loginResult.token,
      exp: loginResult.exp,
    });
  } catch (error: any) {
    if (error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Registration failed", message: error.message },
      { status: 400 }
    );
  }
}

function sanitizeUser(user: any) {
  const { password, salt, hash, ...safe } = user;
  return safe;
}
