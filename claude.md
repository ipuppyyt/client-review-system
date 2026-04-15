@AGENTS.md

# Project: White-label Customer Review Collection Tool

## Overview

This is a multi-tenant SaaS-style application built with Next.js 16, PostgreSQL, and Docker.

The application allows businesses to:

- Collect customer reviews via public forms
- Customize branding (logo, colors, business name)
- Access reviews via API endpoints
- Embed or fetch reviews into their own websites

The system supports:

- First-time setup flow (auto-create superadmin)
- Multi-tenant architecture (each business isolated)
- Clean modern UI (Tailwind + shadcn/ui recommended)

---

## Core Requirements

### 1. Authentication & Roles

- Use email/password auth (JWT or session-based)
- Roles:
  - SUPERADMIN (first user created if DB is empty)
  - ADMIN (business owner)
  - USER (optional internal users)

### 2. First-Time Setup

- On first app launch:
  - Check if users table is empty
  - If empty → redirect to `/setup`
  - Create SUPERADMIN account
  - Create default organization

---

### 3. Multi-Tenant Architecture

Entities:

- Organization
  - id
  - name
  - slug
  - branding_id
  - created_at

- Branding
  - logo_url
  - primary_color
  - secondary_color
  - font_family

- User
  - id
  - email
  - password_hash
  - role
  - organization_id

- Review
  - id
  - organization_id
  - customer_name
  - rating (1–5)
  - message
  - created_at
  - is_published

---

### 4. Review Collection

Public route:
/r/[organization_slug]

Features:

- Displays branded UI
- Customer submits:
  - name
  - rating
  - message

Store in DB:

- Default `is_published = false`

---

### 5. Admin Dashboard

Routes:
/dashboard
/dashboard/reviews
/dashboard/branding
/dashboard/settings

Features:

- View all reviews
- Approve/reject reviews
- Edit branding
- Copy API endpoint

---

### 6. Public API

Endpoint:
GET /api/reviews/[organization_slug]

Returns:

```json
{
  "reviews": [
    {
      "name": "John",
      "rating": 5,
      "message": "Great service",
      "date": "2026-01-01"
    }
  ]
}
```

Rules:

- Only return is_published = true
- Cache responses if possible

---

### 7. Branding System

Each organization can:

Upload logo
Set primary/secondary colors
Preview UI

Apply branding dynamically:

Tailwind CSS variables or inline styles

---

### 8. UI/UX Guidelines

- Use Tailwind CSS
- Use shadcn/ui components
- Clean, minimal, modern layout
- Mobile-first responsive design
- Consistent spacing and typography

---

### 9. Tech Stack

- Next.js 16 (App Router)
- PostgreSQL
- Prisma ORM
- Tailwind CSS + shadcn/ui
- Docker + Docker Compose

---

### 10. Docker Setup

Services:

- web (Next.js app)
- db (Postgres)

Environment variables:

- DATABASE_URL
- NEXTAUTH_SECRET (if using auth)
- STORAGE (optional)

---

### 11. Code Quality

- Use TypeScript
- Modular folder structure
- Reusable components
- Clean separation:
  - lib/
  - db/
  - components/
  - app/

---

### 12. Security

- Hash passwords (bcrypt)
- Validate all inputs (Zod)
- Prevent cross-tenant access
- Rate limit public API

---

### 13. Nice-to-Have (Optional)

- Review analytics
- Embed widget script
- Email notifications
- Webhooks

---

### 14. Folder Structure

```
/app
  /api
  /dashboard
  /r
  page.tsx
  layout.tsx
/components
  /ui
  /auth
  /dashboard
/assets
  /images
  /fonts
  /icons
/db
/lib
/public
/prisma
Dockerfile
compose.yml
.env.example
README.md
```

---

### Expectations

Claude should:

- Generate production-ready code
- Avoid placeholders
- Use best practices
- Keep code clean and readable
- Build incrementally if needed