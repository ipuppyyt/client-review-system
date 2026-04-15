import { auth as proxyAuth } from "@/auth";

export default proxyAuth;

export const config = {
  // Only execute proxy on non-static, non-api routes basically.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
