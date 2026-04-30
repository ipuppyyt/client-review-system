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
                rating: true,
                message: true,
                photos: true,
                videos: true,
                created_at: true,
                client: {
                    select: {
                        name: true,
                        company_name: true,
                        logo_url: true,
                    }
                }
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


