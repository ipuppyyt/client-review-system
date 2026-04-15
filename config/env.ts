export const env = {
    // Redis connection string
    REDIS_URL: process.env["REDIS_URL"]!,
    // PostgreSQL connection string
    DATABASE_URL: process.env["DATABASE_URL"]!,
    // NextAuth.js secrets and URLs
    NEXTAUTH_SECRET: process.env["NEXTAUTH_SECRET"]!,
    NEXTAUTH_URL: process.env["NEXTAUTH_URL"]!,
    // Base URL for the application, used in email links and redirects
    NEXT_PUBLIC_BASE_URL: process.env["NEXT_PUBLIC_BASE_URL"]!,
};