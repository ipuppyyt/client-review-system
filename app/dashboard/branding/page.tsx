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

const inputClass = `w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700
    rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    transition-colors`;

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
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}><CardBody><div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></CardBody></Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!branding) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Unable to load branding settings</p>
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
                {/* Left: Inputs */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Logo URL */}
                    <Card>
                        <CardBody>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Logo URL
                            </label>
                            <input
                                type="text"
                                value={branding.logo_url || ''}
                                onChange={(e) => handleChange('logo_url', e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className={inputClass}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Enter a URL to your logo (PNG, JPG, SVG recommended)
                            </p>
                        </CardBody>
                    </Card>

                    {/* Primary Color */}
                    <Card>
                        <CardBody>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Primary Color
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={branding.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    className="w-14 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700 shrink-0 bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={branding.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    placeholder="#000000"
                                    className={`${inputClass} font-mono`}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Used for buttons and highlights</p>
                        </CardBody>
                    </Card>

                    {/* Secondary Color */}
                    <Card>
                        <CardBody>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Secondary Color
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={branding.secondary_color}
                                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                                    className="w-14 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700 shrink-0 bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={branding.secondary_color}
                                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                                    placeholder="#ffffff"
                                    className={`${inputClass} font-mono`}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Used for backgrounds and accents</p>
                        </CardBody>
                    </Card>

                    {/* Font Family */}
                    <Card>
                        <CardBody>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Font Family
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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Used for all text on your review pages</p>
                        </CardBody>
                    </Card>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Save className="w-5 h-5" />Save Changes</>}
                    </button>
                </div>

                {/* Right: Preview */}
                <div>
                    <Card className="sticky top-6">
                        <CardBody>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Live Preview</h3>

                            <div className="rounded-lg overflow-hidden border-2 transition-colors duration-300"
                                style={{ borderColor: branding.primary_color }}>
                                {/* Logo area */}
                                <div className="p-6 text-center flex items-center justify-center min-h-[100px] transition-colors duration-300"
                                    style={{ backgroundColor: branding.secondary_color }}>
                                    {branding.logo_url ? (
                                        <img src={branding.logo_url} alt="Logo" className="max-h-10 max-w-full mx-auto"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    ) : (
                                        <span className="text-gray-400 text-xs">Your logo here</span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3 bg-white">
                                    <div className="text-sm font-medium px-4 py-2 rounded text-center text-white transition-colors duration-300"
                                        style={{ backgroundColor: branding.primary_color }}>
                                        Submit Review
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="h-8 rounded border border-gray-200 transition-colors duration-300"
                                            style={{ backgroundColor: branding.primary_color }}
                                            title="Primary color" />
                                        <div className="h-8 rounded border border-gray-200 transition-colors duration-300"
                                            style={{ backgroundColor: branding.secondary_color }}
                                            title="Secondary color" />
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded border border-gray-100 text-center">
                                        <p className="text-xs text-gray-600" style={{ fontFamily: branding.font_family }}>
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
