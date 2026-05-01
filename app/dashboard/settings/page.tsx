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

const disabledInput = 'input input-bordered input-disabled w-full text-sm font-mono';

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
                <div className="h-10 bg-base-200 rounded w-32 animate-pulse" />
                {[1, 2, 3].map((i) => (
                    <Card key={i}><CardBody><div className="h-24 bg-base-200 rounded animate-pulse" /></CardBody></Card>
                ))}
            </div>
        );
    }

    if (!org) {
        return (
            <div className="text-center py-12">
                <p className="text-base-content/70">Unable to load organization settings</p>
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
                    <h2 className="text-lg font-semibold text-base-content mb-6">
                        Organization Information
                    </h2>
                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="label">
                                <span className="label-text">Organization Name</span>
                            </label>
                            <input type="text" value={org.name} disabled className={disabledInput} />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">Contact support to change your organization name</span>
                            </label>
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="label">
                                <span className="label-text">Organization Slug</span>
                            </label>
                            <div className="flex gap-2 flex-col sm:flex-row">
                                <input type="text" value={org.slug} disabled className={`${disabledInput} flex-1`} />
                                <button
                                    onClick={() => copyToClipboard(org.slug, 'slug')}
                                    className="btn btn-ghost btn-sm w-full sm:w-auto flex items-center justify-center gap-2"
                                >
                                    {copied === 'slug' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                                    <span>{copied === 'slug' ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Created */}
                        <div>
                            <label className="label">
                                <span className="label-text">Created On</span>
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
                    <h2 className="text-lg font-semibold text-base-content mb-2">
                        Review Form URL
                    </h2>
                    <p className="text-sm text-base-content/70 mb-4">
                        Share this URL with your customers to collect reviews
                    </p>

                    <div className="flex gap-2 flex-col sm:flex-row mb-4">
                        <input type="text" value={reviewFormUrl} disabled className={`${disabledInput} flex-1`} />
                        <button
                            onClick={() => copyToClipboard(reviewFormUrl, 'url')}
                            className="btn btn-primary btn-sm w-full sm:w-auto flex items-center justify-center gap-2 shrink-0"
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
                    <h2 className="text-lg font-semibold text-base-content mb-2">
                        API Documentation
                    </h2>
                    <p className="text-sm text-base-content/70 mb-6">
                        Use this endpoint to embed published reviews in your website
                    </p>

                    <div className="space-y-6">
                        {/* Endpoint */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-base-content">
                                    GET Published Reviews
                                </h3>
                                <button
                                    onClick={() => copyToClipboard(apiEndpoint, 'api')}
                                    className="btn btn-link btn-xs text-primary hover:text-primary-focus"
                                >
                                    {copied === 'api' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copied === 'api' ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <div className="mockup-code bg-base-300 text-success p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                                <pre className="text-base-content/70">GET {apiEndpoint}</pre>
                            </div>
                            <p className="text-xs text-base-content/70 mt-2">
                                Returns an array of published reviews. No authentication required.
                            </p>
                        </div>

                        {/* Response */}
                        <div className="divider"></div>
                        <h3 className="text-sm font-semibold text-base-content mb-2">
                            Example Response
                        </h3>
                        <div className="mockup-code bg-base-300 text-base-content p-4 font-mono text-xs overflow-x-auto">
                            <pre className="whitespace-pre text-base-content/80">{`[
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
            </CardBody>
        </Card>

            {/* Danger Zone */ }
    <Card className="border-error">
        <CardBody className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-error mb-2">Danger Zone</h2>
            <p className="text-sm text-error/80 mb-4">
                These actions are irreversible. Please proceed with caution.
            </p>
            <button
                disabled
                className="btn btn-error btn-sm w-full sm:w-auto opacity-50 cursor-not-allowed"
            >
                Delete Organization
            </button>
            <p className="text-xs text-error/70 mt-2">
                Coming soon — contact support to delete your organization.
            </p>
        </CardBody>
    </Card>
        </div >
    );
}
