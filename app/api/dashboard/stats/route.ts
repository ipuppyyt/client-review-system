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

        // Get review statistics
        const reviews = await prisma.review.findMany({
            where: { organization_id: orgId },
        });

        const totalReviews = reviews.length;
        const publishedReviews = reviews.filter((r) => r.is_published).length;
        const pendingReviews = totalReviews - publishedReviews;

        const averageRating =
            reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

        return NextResponse.json({
            totalReviews,
            publishedReviews,
            pendingReviews,
            averageRating,
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
