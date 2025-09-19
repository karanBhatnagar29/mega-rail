import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  // All routes that should be protected
  const protectedPaths = ["/create-card", "/cards"];
  console.log("cookies:", req.cookies.getAll());

  const isProtected =
    pathname.startsWith("/main/") ||
    protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/create-card", // protect this route
    "/cards",
    "/cards/:path*", // protect /cards and all its subroutes
  ],
};
