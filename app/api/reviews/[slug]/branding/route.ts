import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Find organization by slug
        const organization = await prisma.organization.findUnique({
            where: { slug },
            include: { branding: true },
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Return organization info and branding (with defaults)
        const branding = organization.branding || {
            logo_url: null,
            primary_color: '#000000',
            secondary_color: '#ffffff',
            font_family: 'Inter',
        };

        return NextResponse.json({
            organization: {
                name: organization.name,
                slug: organization.slug,
            },
            branding,
        });
    } catch (error) {
        console.error('Get branding error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
