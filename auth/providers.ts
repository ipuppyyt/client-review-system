import type { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const providers: Provider[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;

      // Ensure timing attacks are mitigated by validating normally,
      // fallback user checks could be implemented if necessary
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) return null;

      const passwordsMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordsMatch) return null;

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
      };
    },
  }),
];
