import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import * as z from "zod";

const setupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  orgName: z.string().min(2, "Organization name must be at least 2 characters"),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        { error: "Setup already completed. Users exist." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = setupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, orgName, logoUrl } = validation.data;

    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          slug,
        },
      });

      const branding = await tx.branding.create({
        data: {
          organization_id: organization.id,
          logo_url: logoUrl || null,
          primary_color: "#65c3c8",
          secondary_color: "#f8fafc",
        },
      });

      await tx.organization.update({
        where: { id: organization.id },
        data: { branding: { connect: { id: branding.id } } },
      });

      const user = await tx.user.create({
        data: {
          email,
          password_hash: hashedPassword,
          role: "SUPERADMIN",
          organization_id: organization.id,
        },
      });

      return { user, organization, branding };
    });

    return NextResponse.json({
      success: true,
      message: "Setup completed successfully",
      data: {
        userId: result.user.id,
        email: result.user.email,
        organizationId: result.organization.id,
        organizationName: result.organization.name,
        slug: result.organization.slug,
      },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during setup" },
      { status: 500 }
    );
  }
}
