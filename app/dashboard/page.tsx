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
            iconBg: 'bg-blue-100 dark:bg-blue-950/50',
            iconColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            label: 'Published',
            value: stats.publishedReviews,
            icon: Eye,
            iconBg: 'bg-green-100 dark:bg-green-950/50',
            iconColor: 'text-green-600 dark:text-green-400',
        },
        {
            label: 'Pending',
            value: stats.pendingReviews,
            icon: Lock,
            iconBg: 'bg-yellow-100 dark:bg-yellow-950/50',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
        },
        {
            label: 'Avg Rating',
            value: stats.averageRating.toFixed(1),
            icon: Star,
            iconBg: 'bg-purple-100 dark:bg-purple-950/50',
            iconColor: 'text-purple-600 dark:text-purple-400',
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
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium truncate">{label}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {loading ? (
                                            <span className="inline-block w-10 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
                {/* API Endpoint */}
                <Card>
                    <CardBody className="p-5 sm:p-6 flex flex-col h-full">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            Public API Endpoint
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Use this endpoint to fetch your published reviews
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 font-mono text-sm text-gray-700 dark:text-gray-300 break-all mt-auto">
                            {orgSlug ? apiEndpoint : <span className="text-gray-400">Loading...</span>}
                        </div>
                        <button
                            onClick={handleCopy}
                            disabled={!orgSlug}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors
                                bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy Endpoint'}
                        </button>
                    </CardBody>
                </Card>

                {/* Getting Started */}
                <Card>
                    <CardBody className="p-5 sm:p-6 flex flex-col h-full">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Getting Started
                        </h2>
                        <ul className="space-y-4">
                            {[
                                { step: 1, text: <>Go to <strong>Branding</strong> to customize your review form</> },
                                { step: 2, text: 'Share your review form URL with customers' },
                                { step: 3, text: <>Approve reviews in the <strong>Reviews</strong> section</> },
                                { step: 4, text: 'Embed reviews on your website using the API' },
                            ].map(({ step, text }) => (
                                <li key={step} className="flex gap-3 items-start">
                                    <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-semibold shrink-0">
                                        {step}
                                    </span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 pt-1">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </CardBody>
                </Card>
            </FluidGrid>
        </div>
    );
}
