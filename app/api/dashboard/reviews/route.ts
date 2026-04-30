import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { cache, cacheKeys } from '@/lib/redis';
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

        const cacheKey = cacheKeys.dashboardReviews(orgId);
        const cachedReviews = await cache.get(cacheKey);
        if (cachedReviews) {
            return NextResponse.json(cachedReviews);
        }

        // Fetch all reviews for organization
        const reviews = await prisma.review.findMany({
            where: { organization_id: orgId },
            include: { client: true },
            orderBy: { created_at: 'desc' },
        });

        await cache.set(cacheKey, reviews, 60); // 1 minute cache for dashboard

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.organization_id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { reviewId, is_published } = await request.json();

        // Verify review belongs to user's organization
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review || review.organization_id !== session.user.organization_id) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            );
        }

        // Update review
        const updated = await prisma.review.update({
            where: { id: reviewId },
            data: { is_published },
        });

        // Invalidate caches
        const org = await prisma.organization.findUnique({
            where: { id: session.user.organization_id },
            select: { slug: true }
        });
        if (org) {
            await cache.del(cacheKeys.publicReviews(org.slug));
        }
        await cache.del(cacheKeys.dashboardReviews(session.user.organization_id));
        await cache.del(cacheKeys.dashboardStats(session.user.organization_id));

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Update review error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.organization_id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { reviewId } = await request.json();

        // Verify review belongs to user's organization
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review || review.organization_id !== session.user.organization_id) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            );
        }

        // Delete review
        await prisma.review.delete({
            where: { id: reviewId },
        });

        // Invalidate caches
        const org = await prisma.organization.findUnique({
            where: { id: session.user.organization_id },
            select: { slug: true }
        });
        if (org) {
            await cache.del(cacheKeys.publicReviews(org.slug));
        }
        await cache.del(cacheKeys.dashboardReviews(session.user.organization_id));
        await cache.del(cacheKeys.dashboardStats(session.user.organization_id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete review error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
