'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { Copy, Check } from 'lucide-react';
import { PageHeader } from '@/components/fluid-layout';
import { Card, CardBody } from '@/components/card';
import { Alert } from '@/components/alert';

interface OrganizationData {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

const disabledInput = `w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700
    rounded-lg bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400
    cursor-not-allowed font-mono text-sm`;

export default function SettingsPage() {
    const [org, setOrg] = useState<OrganizationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState('');

    useEffect(() => { fetchOrgData(); }, []);

    const fetchOrgData = async () => {
        try {
            const session = await getSession();
            if (!session?.user?.organization_id) return;
            const response = await fetch(`/api/dashboard/organization?org=${session.user.organization_id}`);
            if (response.ok) setOrg(await response.json());
        } catch (error) {
            console.error('Failed to fetch organization:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(''), 2000);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />
                {[1, 2, 3].map((i) => (
                    <Card key={i}><CardBody><div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></CardBody></Card>
                ))}
            </div>
        );
    }

    if (!org) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Unable to load organization settings</p>
            </div>
        );
    }

    const reviewFormUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/r/${org.slug}`;
    const apiEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews/${org.slug}`;

    return (
        <div className="space-y-6 sm:space-y-8">
            <PageHeader
                title="Settings"
                description="Manage your organization and account settings"
            />

            {/* Organization Info */}
            <Card>
                <CardBody className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Organization Information
                    </h2>
                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Organization Name
                            </label>
                            <input type="text" value={org.name} disabled className={disabledInput} />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                Contact support to change your organization name
                            </p>
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Organization Slug
                            </label>
                            <div className="flex gap-2 flex-col sm:flex-row">
                                <input type="text" value={org.slug} disabled className={`${disabledInput} flex-1`} />
                                <button
                                    onClick={() => copyToClipboard(org.slug, 'slug')}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    {copied === 'slug' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    <span>{copied === 'slug' ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Created */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Created On
                            </label>
                            <input
                                type="text"
                                value={new Date(org.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                disabled
                                className={disabledInput}
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Review Form URL */}
            <Card>
                <CardBody className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Review Form URL
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Share this URL with your customers to collect reviews
                    </p>

                    <div className="flex gap-2 flex-col sm:flex-row mb-4">
                        <input type="text" value={reviewFormUrl} disabled className={`${disabledInput} flex-1`} />
                        <button
                            onClick={() => copyToClipboard(reviewFormUrl, 'url')}
                            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium shrink-0"
                        >
                            {copied === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copied === 'url' ? 'Copied!' : 'Copy URL'}</span>
                        </button>
                    </div>

                    <Alert
                        type="info"
                        message="Customers submit reviews through this page. Reviews appear in your dashboard after submission."
                    />
                </CardBody>
            </Card>

            {/* API Docs */}
            <Card>
                <CardBody className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        API Documentation
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Use this endpoint to embed published reviews in your website
                    </p>

                    <div className="space-y-6">
                        {/* Endpoint */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    GET Published Reviews
                                </h3>
                                <button
                                    onClick={() => copyToClipboard(apiEndpoint, 'api')}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                    {copied === 'api' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copied === 'api' ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <div className="bg-gray-900 dark:bg-gray-950 text-green-400 rounded-lg p-4 font-mono text-xs sm:text-sm overflow-x-auto border border-gray-800">
                                <span className="text-gray-500 select-none">GET </span>
                                {apiEndpoint}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Returns an array of published reviews. No authentication required.
                            </p>
                        </div>

                        {/* Response */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Example Response
                            </h3>
                            <div className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-4 font-mono text-xs overflow-x-auto border border-gray-800">
                                <pre className="whitespace-pre text-gray-300">{`[
  {
    "id": "uuid",
    "customer_name": "Jane Smith",
    "rating": 5,
    "message": "Absolutely love this service!",
    "created_at": "2024-01-15T10:30:00Z"
  }
]`}</pre>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 sm:p-6">
                <h2 className="text-base font-semibold text-red-900 dark:text-red-300 mb-2">Danger Zone</h2>
                <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                    These actions are irreversible. Please proceed with caution.
                </p>
                <button
                    disabled
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
                >
                    Delete Organization
                </button>
                <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                    Coming soon — contact support to delete your organization.
                </p>
            </div>
        </div>
    );
}
