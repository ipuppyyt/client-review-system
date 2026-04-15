import NextAuth from "next-auth";
import { callbacks } from "./callbacks";
import { providers } from "./providers";
import { cookies } from "./cookies";

export const { auth, handlers, signIn, signOut } = NextAuth({
  cookies,
  providers,
  session: { strategy: "jwt" },
  callbacks,
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});