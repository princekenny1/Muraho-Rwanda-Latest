import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/create-first-user"];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("mrw-token")?.value;

  if (!token) {
    const loginURL = req.nextUrl.clone();
    loginURL.pathname = "/admin/login";
    loginURL.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginURL);
  }

  // Payload's root /admin view can resolve to 404 in some auth states.
  // Use a stable landing page once authenticated.
  if (pathname === "/admin") {
    const dashboardURL = req.nextUrl.clone();
    dashboardURL.pathname = "/admin/collections/users";
    dashboardURL.search = "";
    return NextResponse.redirect(dashboardURL);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
