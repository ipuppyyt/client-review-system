import { prisma } from '@/lib/db';
import { cache, cacheKeys } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        // Find client and organization
        const client = await prisma.client.findUnique({
            where: { token },
            include: {
                organization: {
                    include: { branding: true },
                },
            },
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Invalid link or client not found' },
                { status: 404 }
            );
        }

        if (client.is_completed) {
            return NextResponse.json(
                { error: 'Review already submitted for this link' },
                { status: 400 }
            );
        }

        const branding = client.organization.branding || {
            logo_url: null,
            primary_color: '#000000',
            secondary_color: '#ffffff',
            font_family: 'Inter',
        };

        return NextResponse.json({
            client: {
                name: client.name,
                company_name: client.company_name,
                logo_url: client.logo_url,
            },
            organization: {
                name: client.organization.name,
                slug: client.organization.slug,
            },
            branding,
        });
    } catch (error) {
        console.error('Get review link error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const { rating, message, photos = [], videos = [] } = await request.json();

        // Validate input
        if (!rating || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Validate token and find client
        const client = await prisma.client.findUnique({
            where: { token },
            include: { organization: true },
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Invalid token or client not found' },
                { status: 404 }
            );
        }

        if (client.is_completed) {
            return NextResponse.json(
                { error: 'Review already submitted for this link' },
                { status: 400 }
            );
        }

        // Create review (unpublished by default)
        const review = await prisma.review.create({
            data: {
                organization_id: client.organization_id,
                client_id: client.id,
                rating,
                message,
                photos,
                videos,
                is_published: false,
            },
        });

        // Mark client as completed
        await prisma.client.update({
            where: { id: client.id },
            data: { is_completed: true },
        });

        // Invalidate caches
        const orgSlug = client.organization.slug;
        await cache.del(cacheKeys.publicReviews(orgSlug));
        await cache.del(cacheKeys.dashboardReviews(client.organization_id));
        await cache.del(cacheKeys.dashboardStats(client.organization_id));

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error('Submit review error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
