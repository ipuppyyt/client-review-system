@AGENTS.md

# Project: White-label Customer Review Collection Tool

## Overview

This is a multi-tenant SaaS-style application built with **Next.js 16 (App Router)**, **PostgreSQL**, and **Docker**.

The application allows businesses to:

- Collect customer reviews via public forms
- Customize branding (logo, colors, business name)
- Access reviews via API endpoints
- Embed or fetch reviews into their own websites

The system supports:

- First-time setup flow (auto-create superadmin)
- Multi-tenant architecture (each business isolated)
- Clean modern UI (custom components with Tailwind CSS)

---

## Current Project State

This is a **fresh project** that has been initialized with the following:

### ✅ Implemented

- **Authentication system** using NextAuth.js 5 (beta) with credentials provider
- **Prisma ORM** with modularized schema (split into separate files)
- **Database models**: User, Organization, Branding, Review
- **Role-based access**: SUPERADMIN, ADMIN
- **Prisma adapter** for PostgreSQL with connection pooling
- **Custom Auth callbacks** for session/JWT handling
- **Cookie configuration** for NextAuth tokens
- **Zod validation** for form inputs
- **Bcrypt password hashing**
- **Basic API routes** structure in `app/api/`
- **Dashboard routes** structure in `app/dashboard/`
- **Login and Setup pages** at `/login` and `/setup`
- **Docker setup** with PostgreSQL

### 📦 Project Structure

```
/app
  /api          - API routes (basic structure)
  /dashboard    - Dashboard routes (basic structure)
  /login        - Login page
  /setup        - Setup page (first-time users)
  /unauthorized - 401 page
  layout.tsx    - Root layout
  favicon.ico   - Favicon
/prisma
  enums.prisma      - Enum definitions (Role)
  models.prisma     - Data models (User, Organization, Branding, Review)
  index.prisma      - Prisma generator configuration
/lib
  db.ts                 - Prisma client with PostgreSQL adapter
  /generated            - Generated Prisma client
/config
  index.ts              - Config exports
  env.ts                - Environment variables
  config.tsx            - App configuration (cookies, addresses)
/components             - Component folder (currently empty)
/auth
  index.ts              - NextAuth configuration
  callbacks.ts          - Auth callbacks for sessions/JWT
  providers.ts          - Credential provider with Zod validation
  cookies.ts            - NextAuth cookie configuration
/public
  favicon.ico           - Public assets
Dockerfile
compose.yml
.env.example
next.config.ts
prisma.config.ts
proxy.ts
```

### 📊 Database Schema

**Users table:**

- id (uuid, primary key)
- email (unique)
- password_hash
- role (SUPERADMIN, ADMIN)
- organization_id (foreign key)
- created_at

**Organizations table:**

- id (uuid, primary key)
- name
- slug (unique)
- created_at
- branding_id (optional)

**Branding table:**

- id (uuid, primary key)
- organization_id (unique, foreign key)
- logo_url (optional)
- primary_color (default: #000000)
- secondary_color (default: #ffffff)
- font_family (default: Inter)

**Reviews table:**

- id (uuid, primary key)
- organization_id (foreign key)
- customer_name
- rating (1-5)
- message
- is_published (default: false)
- created_at

---

## Core Requirements

### 1. Authentication & Roles

- Use email/password auth (JWT + session strategy)
- Roles:
  - SUPERADMIN (first user created if DB is empty)
  - ADMIN (business owner)

### 2. First-Time Setup

- On first app launch:
  - Check if users table is empty
  - If empty → redirect to `/setup`
  - Create SUPERADMIN account
  - Create default organization

### 3. Multi-Tenant Architecture

Entities already defined in Prisma schema:

- Organization (per-business isolation)
- Branding (logo, colors, fonts)
- User (with role and organization)
- Review (customer feedback)

### 4. Review Collection

Public route structure:

- `/r/[organization_slug]` - Public review submission page

Features:

- Displays branded UI
- Customer submits: name, rating, message
- Store in DB with `is_published = false` by default

### 5. Admin Dashboard

Routes structure exists:

- `/dashboard`
- `/dashboard/reviews`
- `/dashboard/branding`
- `/dashboard/settings`

Features:

- View all reviews
- Approve/reject reviews (toggle is_published)
- Edit branding (logo, colors)
- Copy API endpoint

### 6. Public API

Endpoint structure:

- `GET /api/reviews/[organization_slug]`

Returns only published reviews with:

- name, rating, message, date

### 7. Branding System

Each organization can:

- Upload logo
- Set primary/secondary colors
- Set font family

Apply branding dynamically via:

- Tailwind CSS variables
- Inline styles

### 8. UI/UX Guidelines

- **Use Tailwind CSS v4**
- **Create custom components** (DO NOT use shadcn/ui - see note below)
- Clean, minimal, modern layout
- Mobile-first responsive design
- Consistent spacing and typography

### 9. Tech Stack

- Next.js 16 (App Router)
- PostgreSQL
- Prisma ORM (v7.7.0)
- Tailwind CSS v4.2.2
- Docker + Docker Compose
- NextAuth.js 5 (beta)
- Zod for validation
- bcryptjs for password hashing

### 10. Docker Setup

Services:

- web (Next.js app)
- db (Postgres)

Environment variables:

- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- NEXT_PUBLIC_BASE_URL
- REDIS_URL (optional)

### 11. Code Quality

- Use TypeScript
- Modular folder structure
- Clean separation:
  - lib/ - utilities and database
  - db/ - database layer
  - auth/ - authentication
  - config/ - configuration
  - app/ - Next.js app router pages
- Avoid inline styles where possible

### 12. Security

- Hash passwords (bcrypt)
- Validate all inputs (Zod)
- Prevent cross-tenant access
- Rate limit public API (to be implemented)
- Use httpOnly cookies for sessions
- Secure cookies in production only

### 13. Components

**IMPORTANT - DO NOT USE shadcn/ui:**

The `/components` directory is **intentionally kept minimal**. Do not generate or use shadcn/ui components. Instead:

1. **Create custom components** using Tailwind CSS directly
2. **Build simple, semantic HTML** components with Tailwind classes
3. **Use Lucide React** icons (already installed via `lucide-react`)
4. **Focus on clean, semantic markup**

When a component is needed, manually create it with:

- Basic HTML structure
- Tailwind utility classes for styling
- TypeScript interfaces for props
- Proper accessibility attributes

Examples of components to create manually:

- Card components
- Button components
- Form inputs
- Navigation bars
- Modals/dialogs
- Tables
- Badges/labels

**At the end of the project or when completing a feature:**

Manually install shadcn/ui components if needed:

```bash
npx shadcn-ui@latest init
# Then manually install each component as needed:
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
# etc.
```

Review the installed package.json to see what additional dependencies are required:

```json
{
  "dependencies": {
    "class-variance-authority": "^...",
    "clsx": "^...",
    "tailwind-merge": "^...",
    "tailwindcss-animate": "^...",
    "@radix-ui/react-*": "^..."
  }
}
```

Install these base utilities manually:

```bash
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-slot
# etc.
```

### 14. Folder Structure
```
client-review-system/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── login/
│   │   ├── login-form.tsx
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── layout.tsx
│   └── page.tsx
├── assets/
│   ├── fonts/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── auth/
│   ├── callbacks.ts
│   ├── cookies.ts
│   ├── index.ts
│   └── providers.ts
├── components/
│   └── ui/                     # Empty - shadcn components installed manually
├── config/
│   ├── config.tsx
│   ├── env.ts
│   └── index.ts
├── lib/
│   ├── generated/
│   │   └── prisma/
│   │       ├── internal/
│   │       │   ├── class.ts
│   │       │   ├── prismaNamespace.ts
│   │       │   └── prismaNamespaceBrowser.ts
│   │       ├── models/
│   │       │   ├── Branding.ts
│   │       │   ├── Organization.ts
│   │       │   ├── Review.ts
│   │       │   └── User.ts
│   │       ├── browser.ts
│   │       ├── client.ts
│   │       ├── commonInputTypes.ts
│   │       ├── enums.ts
│   │       └── models.ts
│   └── db.ts
├── meta/
│   ├── index.ts
│   ├── metadata.ts
│   └── viewport.ts
├── prisma/
│   ├── enums.prisma
│   ├── index.prisma
│   └── models.prisma
├── public/                     # Empty directory
├── types/
│   ├── cache-life.d.ts
│   ├── next-auth.d.ts
│   ├── routes.d.ts
│   └── validator.ts
├── .env
├── .gitattributes
├── .gitignore
├── AGENTS.md
├── Dockerfile
├── LICENSE
├── README.md
├── claude.md
├── compose.yml
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── prisma.config.ts
├── proxy.ts
├── tsconfig.json
└── tsconfig.tsbuildinfo
```


### 15. Environment Variables

Create `.env.local` with:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/review-system?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 16. Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server
pnpm build           # Build for production
pnpm db:generate     # Generate Prisma client
pnpm db:push         # Push schema to database
```

### 17. Next Steps

1. Complete `/setup` page with superadmin creation
2. Build public review submission page at `/r/[slug]`
3. Implement admin dashboard pages
4. Create review form and submission logic
5. Build review approval workflow
6. Implement branding editor
7. Create public API endpoints
8. Add rate limiting and security headers

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
pnpm db:generate

# 3. Start dev server
pnpm dev

# 4. Access at http://localhost:3000
```

---

## Notes

- Read `AGENTS.md` for important notes about Next.js 16 breaking changes
- The project uses NextAuth.js 5 beta API
- TypeScript strict mode is enabled
- The Prisma schema is split into multiple files for organization
- **Important:** Do not use shadcn/ui components. Install shadcn/ui components manually at the end.
