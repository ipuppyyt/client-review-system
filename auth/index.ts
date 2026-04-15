import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";
import { callbacks } from "./callbacks";
import { providers } from "./providers";
import { cookies } from "./cookies";
import { prisma } from "@/lib/db";
import NextAuth from "next-auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
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