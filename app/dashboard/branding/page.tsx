'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { Save, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/fluid-layout';
import { Alert } from '@/components/alert';
import { Card, CardBody } from '@/components/card';

interface BrandingData {
    id: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    font_family: string;
}

const fontOptions = ['Inter', 'Roboto', 'Poppins', 'Playfair Display', 'Open Sans', 'Lato'];

const inputClass = `input input-bordered input-primary w-full`;

export default function BrandingPage() {
    const [branding, setBranding] = useState<BrandingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { fetchBranding(); }, []);

    const fetchBranding = async () => {
        try {
            const session = await getSession();
            if (!session?.user?.organization_id) return;
            const response = await fetch(`/api/dashboard/branding?org=${session.user.organization_id}`);
            if (response.ok) setBranding(await response.json());
        } catch {
            setError('Failed to load branding settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof BrandingData, value: string) => {
        if (branding) {
            setBranding({ ...branding, [field]: value });
            setError('');
            setSuccess('');
        }
    };

    const handleSave = async () => {
        if (!branding) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch('/api/dashboard/branding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    primary_color: branding.primary_color,
                    secondary_color: branding.secondary_color,
                    font_family: branding.font_family,
                    logo_url: branding.logo_url,
                }),
            });
            if (response.ok) {
                setSuccess('Branding updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to save branding settings');
            }
        } catch {
            setError('An error occurred while saving');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 bg-base-200 rounded w-48 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}><CardBody><div className="h-16 bg-base-200 rounded animate-pulse" /></CardBody></Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!branding) {
        return (
            <div className="text-center py-12">
                <p className="text-base-content/60">Unable to load branding settings</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <PageHeader
                title="Branding Settings"
                description="Customize the appearance of your review form and pages"
            />

            {error && <Alert type="error" title="Error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" title="Success" message={success} onClose={() => setSuccess('')} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardBody>
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text">Logo URL</span>
                                </label>
                                <input
                                    type="text"
                                    value={branding.logo_url || ''}
                                    onChange={(e) => handleChange('logo_url', e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className={inputClass}
                                />
                            </div>
                            <p className="text-xs text-base-content/60 mt-2">
                                Enter a URL to your logo (PNG, JPG, SVG recommended)
                            </p>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text">Font Family</span>
                                </label>
                                <select
                                    value={branding.font_family}
                                    onChange={(e) => handleChange('font_family', e.target.value)}
                                    className={inputClass}
                                >
                                    {fontOptions.map((font) => (
                                        <option key={font} value={font}>{font}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-base-content/60 mt-2">
                                DaisyUI theme colors will style your pages by default.
                            </p>
                        </CardBody>
                    </Card>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary w-full"
                    >
                        {saving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Save className="w-5 h-5" />Save Changes</>}
                    </button>
                </div>

                <div>
                    <Card className="sticky top-6">
                        <CardBody>
                            <h3 className="text-sm font-semibold text-base-content mb-4">Live Preview</h3>
                            <div className="rounded-3xl border border-base-200 bg-base-200 overflow-hidden">
                                <div className="p-6 bg-base-300 text-center min-h-25 flex items-center justify-center">
                                    {branding.logo_url ? (
                                        <img src={branding.logo_url} alt="Logo" className="mx-auto max-h-10" />
                                    ) : (
                                        <span className="text-base-content/50 text-sm">Your logo here</span>
                                    )}
                                </div>
                                <div className="p-6 space-y-4 bg-base-100">
                                    <div className="badge badge-lg badge-primary w-full">Submit Review</div>
                                    <div className="rounded-2xl border border-base-200 bg-base-200 p-4 text-center">
                                        <p className="text-xs text-base-content/70" style={{ fontFamily: branding.font_family }}>
                                            {branding.font_family}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
