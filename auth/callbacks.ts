import type { Session, User } from "next-auth";
import type { NextRequest } from "next/server";

export const callbacks = {
  authorized({
    auth,
    request: { nextUrl },
  }: {
    auth: Session | null;
    request: NextRequest;
  }) {
    const isLoggedIn = !!auth?.user;
    const isDashboard = nextUrl.pathname.startsWith("/dashboard");
    const isAuthPage = nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
      return true;
    }

    if (isDashboard) {
      if (isLoggedIn) return true;
      return false;
    }

    return true;
  },
  async jwt({ token, user }: { token: any; user?: User }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
      token.organization_id = user.organization_id;
    }
    return token;
  },
  async session({ session, token }: { session: Session; token: any }) {
    if (token && session.user) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.organization_id = token.organization_id as string | null;
    }
    return session;
  },
};
