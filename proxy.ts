import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

let usersExistCache: boolean | null = null;

async function checkUsersExist(): Promise<boolean> {
  if (usersExistCache !== null) {
    return usersExistCache;
  }

  try {
    const userCount = await prisma.user.count();
    usersExistCache = userCount > 0;
    return usersExistCache;
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

  // If no session and trying to access dashboard, redirect to login
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
