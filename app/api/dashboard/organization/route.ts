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

    const cacheKey = cacheKeys.dashboardOrganization(orgId);
    const cachedOrg = await cache.get(cacheKey);
    if (cachedOrg) {
      return NextResponse.json(cachedOrg);
    }

    // Fetch organization
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    await cache.set(cacheKey, organization, 300); // 5 minutes cache

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
