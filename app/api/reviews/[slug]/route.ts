import { prisma } from '@/lib/db';
import { cache, cacheKeys } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const cacheKey = cacheKeys.publicReviews(slug);
        const cachedReviews = await cache.get(cacheKey);
        if (cachedReviews) {
            return NextResponse.json(cachedReviews);
        }

        // Find organization by slug
        const organization = await prisma.organization.findUnique({
            where: { slug },
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Get only published reviews
        const reviews = await prisma.review.findMany({
            where: {
                organization_id: organization.id,
                is_published: true,
            },
            select: {
                id: true,
                customer_name: true,
                rating: true,
                message: true,
                created_at: true,
            },
            orderBy: { created_at: 'desc' },
        });

        await cache.set(cacheKey, reviews, 300); // Cache for 5 minutes

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const { customer_name, rating, message } = await request.json();

        // Validate input
        if (!customer_name || !rating || !message) {
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

        // Find organization by slug
        const organization = await prisma.organization.findUnique({
            where: { slug },
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Create review (unpublished by default)
        const review = await prisma.review.create({
            data: {
                organization_id: organization.id,
                customer_name,
                rating,
                message,
                is_published: false,
            },
        });

        // Invalidate caches
        await cache.del(cacheKeys.publicReviews(slug));
        await cache.del(cacheKeys.dashboardReviews(organization.id));
        await cache.del(cacheKeys.dashboardStats(organization.id));

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
