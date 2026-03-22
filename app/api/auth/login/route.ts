import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const { email, password } = await req.json();

  try {
    const result = await payload.login({
      collection: "users",
      data: { email, password },
    });

    const { password: _, salt, hash, ...safeUser } = result.user as any;

    return NextResponse.json({
      user: safeUser,
      token: result.token,
      exp: result.exp,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }
}
