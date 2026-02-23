import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";

// Routes that don't need authentication
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Verify session cookie
  const token = req.cookies.get("shamiri_session")?.value;
  console.log("[Middleware] Checking auth for path:", pathname, "Token present:", !!token);
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("shamiri_session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
