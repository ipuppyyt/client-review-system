import { config } from "@/config";

const cookieDefaults = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export const cookies = {
  sessionToken: {
    name: `${config.COOKIE.NAME}.session-token`,
    options: { ...cookieDefaults, maxAge: config.COOKIE.MAX_AGE },
  },
  callbackUrl: {
    name: `${config.COOKIE.NAME}.callback-url`,
    options: cookieDefaults,
  },
  csrfToken: {
    name: `${config.COOKIE.NAME}.csrf-token`,
    options: cookieDefaults,
  },
};