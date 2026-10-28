import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  // Define route groups
  const isAuthRoute = pathname.startsWith("/auth");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // 1. Redirect unauthenticated users trying to access dashboard/admin routes
  if (isDashboardRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    // Keep target path to redirect back after login if desired
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users away from auth pages (login, register, forgot-password)
  if (isAuthRoute && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Fallback: redirect bare root "/" to dashboard (which will then redirect to login if unauthenticated)
  if (pathname === "/") {
    const targetUrl = new URL(token ? "/dashboard" : "/auth/login", request.url);
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public static assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
