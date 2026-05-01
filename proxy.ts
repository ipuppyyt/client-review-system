import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

async function checkUsersExist(): Promise<boolean> {
  try {
    const userCount = await prisma.user.count();
    return userCount > 0;
  } catch (error) {
    console.error("Error checking users:", error);
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip setup check for API auth routes and static files
  if (
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/setup" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const usersExist = await checkUsersExist();

  if (!usersExist) {
    // No users exist - allow setup only
    if (pathname !== "/setup") {
      return NextResponse.redirect(new URL("/setup", request.url));
    }
    return NextResponse.next();
  } else {
    // Users exist - block /setup
    if (pathname === "/setup") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Check auth session for protected routes
  const session = await auth();

  const isAuthRoute = pathname === "/login" || pathname === "/";
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // If trying to access protected routes without a session, redirect to login
  if (isProtectedRoute && !session) {
    const callbackUrl = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
  }

  // If session exists and trying to access login or root, redirect to dashboard
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
