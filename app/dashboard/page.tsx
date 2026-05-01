'use client';

import { useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import { Star, MessageCircle, Eye, Lock, Copy, Check } from 'lucide-react';
import { PageHeader, FluidGrid } from '@/components/fluid-layout';
import { Card, CardBody } from '@/components/card';

interface DashboardStats {
    totalReviews: number;
    publishedReviews: number;
    pendingReviews: number;
    averageRating: number;
}

export default function DashboardPage() {
    const [session, setSession] = useState<Session | null>(null);
    const [orgSlug, setOrgSlug] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalReviews: 0,
        publishedReviews: 0,
        pendingReviews: 0,
        averageRating: 0,
    });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sess = await getSession();
                setSession(sess);

                if (sess?.user?.organization_id) {
                    const [statsRes, orgRes] = await Promise.all([
                        fetch(`/api/dashboard/stats?org=${sess.user.organization_id}`),
                        fetch(`/api/dashboard/organization?org=${sess.user.organization_id}`),
                    ]);

                    if (statsRes.ok) setStats(await statsRes.json());
                    if (orgRes.ok) {
                        const orgData = await orgRes.json();
                        setOrgSlug(orgData.slug);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const apiEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews/${orgSlug || 'slug'}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(apiEndpoint);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const statCards = [
        {
            label: 'Total Reviews',
            value: stats.totalReviews,
            icon: MessageCircle,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
        },
        {
            label: 'Published',
            value: stats.publishedReviews,
            icon: Eye,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
        },
        {
            label: 'Pending',
            value: stats.pendingReviews,
            icon: Lock,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
        },
        {
            label: 'Avg Rating',
            value: stats.averageRating.toFixed(1),
            icon: Star,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
        },
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            <PageHeader
                title="Dashboard Overview"
                description="Track your customer reviews and performance metrics"
            />

            {/* Stats Grid */}
            <FluidGrid cols={4}>
                {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
                    <Card key={label}>
                        <CardBody className="p-4 sm:p-6">
                            <div className="flex items-start sm:items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-base-content/60 text-sm font-medium truncate">{label}</p>
                                    <p className="text-3xl font-bold text-base-content mt-2">
                                        {loading ? (
                                            <span className="inline-block w-10 h-8 bg-base-200 rounded animate-pulse" />
                                        ) : value}
                                    </p>
                                </div>
                                <div className={`${iconBg} p-3 rounded-xl shrink-0`}>
                                    <Icon className={`w-6 h-6 ${iconColor}`} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </FluidGrid>

            {/* Lower Cards */}
            <FluidGrid cols={2}>


                {/* Getting Started */}
                <Card className="col-span-2 sm:col-span-1">
                    <CardBody className="p-5 sm:p-6 flex flex-col h-full">
                        <h2 className="text-lg font-semibold text-base-content mb-4">
                            Getting Started
                        </h2>
                        <ul className="space-y-4">
                            {[
                                { step: 1, text: <>Go to <strong>Branding</strong> to customize your review form</> },
                                { step: 2, text: <>Create clients in the <strong>Clients</strong> tab to generate unique review links</> },
                                { step: 3, text: <>Approve reviews in the <strong>Reviews</strong> section</> },
                                { step: 4, text: <>Embed reviews on your website using the <strong>API Docs</strong></> },
                            ].map(({ step, text }) => (
                                <li key={step} className="flex gap-3 items-start">
                                    <span className="bg-primary/10 text-primary rounded-full w-7 h-7 flex items-center justify-center text-sm font-semibold shrink-0">
                                        {step}
                                    </span>
                                    <span className="text-sm text-base-content/70 pt-1">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </CardBody>
                </Card>
            </FluidGrid>
        </div>
    );
}
