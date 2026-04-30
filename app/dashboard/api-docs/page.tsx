'use client';

import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { Card, CardBody } from '@/components/card';
import { PageHeader } from '@/components/fluid-layout';
import { Copy, Check, Code } from 'lucide-react';

export default function ApiDocsPage() {
    const [orgSlug, setOrgSlug] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchOrg = async () => {
            const sess = await getSession();
            if (sess?.user?.organization_id) {
                const orgRes = await fetch(`/api/dashboard/organization?org=${sess.user.organization_id}`);
                if (orgRes.ok) {
                    const orgData = await orgRes.json();
                    setOrgSlug(orgData.slug);
                }
            }
        };
        fetchOrg();
    }, []);

    const apiEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/reviews/${orgSlug || 'your-slug'}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(apiEndpoint);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <PageHeader
                title="API Documentation"
                description="Embed your verified reviews natively into your own platform"
            />

            <Card>
                <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Code className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Public Reviews Endpoint</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            Use this REST endpoint to fetch all of your published reviews. You can hit this endpoint directly from your frontend or backend to display customer feedback on your website.
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <code className="text-sm text-gray-800 dark:text-gray-200 break-all font-mono">
                                GET {apiEndpoint}
                            </code>
                            <button
                                onClick={handleCopy}
                                disabled={!orgSlug}
                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Response Format</h3>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-sm text-green-400 font-mono">
                                    {`[
  {
    "id": "uuid",
    "rating": 5,
    "message": "Amazing service!",
    "photos": ["https://..."],
    "videos": [],
    "created_at": "2024-01-01T00:00:00.000Z",
    "client": {
      "name": "John Doe",
      "company_name": "Acme Corp",
      "logo_url": "https://..."
    }
  }
]`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
