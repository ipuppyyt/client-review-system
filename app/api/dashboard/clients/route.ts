import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.organization_id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, company_name, logo_url, email } = await request.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Client name is required' },
                { status: 400 }
            );
        }

        const client = await prisma.client.create({
            data: {
                organization_id: session.user.organization_id,
                name,
                company_name,
                logo_url,
                email,
            },
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const link = `${baseUrl}/r/${client.token}`;

        return NextResponse.json({ ...client, link }, { status: 201 });
    } catch (error) {
        console.error('Create client error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

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

        const clients = await prisma.client.findMany({
            where: { organization_id: session.user.organization_id },
            orderBy: { created_at: 'desc' },
            include: { review: true }
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error('Get clients error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
