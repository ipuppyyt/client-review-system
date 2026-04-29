import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.organization_id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const orgId = request.nextUrl.searchParams.get('org');

        if (orgId !== session.user.organization_id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Fetch branding for organization
        const branding = await prisma.branding.findUnique({
            where: { organization_id: orgId },
        });

        if (!branding) {
            return NextResponse.json(
                { error: 'Branding not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(branding);
    } catch (error) {
        console.error('Get branding error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.organization_id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { primary_color, secondary_color, font_family, logo_url } =
            await request.json();

        // Verify branding exists for organization
        const existingBranding = await prisma.branding.findUnique({
            where: { organization_id: session.user.organization_id },
        });

        if (!existingBranding) {
            return NextResponse.json(
                { error: 'Branding not found' },
                { status: 404 }
            );
        }

        // Update branding
        const updated = await prisma.branding.update({
            where: { organization_id: session.user.organization_id },
            data: {
                primary_color: primary_color || existingBranding.primary_color,
                secondary_color: secondary_color || existingBranding.secondary_color,
                font_family: font_family || existingBranding.font_family,
                logo_url: logo_url !== undefined ? logo_url : existingBranding.logo_url,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Update branding error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
