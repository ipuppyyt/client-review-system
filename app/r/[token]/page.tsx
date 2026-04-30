'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Loader2 } from 'lucide-react';
import { Alert } from '@/components/alert';
import { Card, CardBody } from '@/components/card';

interface Branding {
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    font_family: string;
}

interface OrganizationInfo {
    name: string;
}

export default function ReviewSubmissionPage() {
    const params = useParams();
    const token = params.token as string;

    const [branding, setBranding] = useState<Branding | null>(null);
    const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
    const [clientName, setClientName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        rating: 5,
        message: '',
        photos: [] as string[],
        videos: [] as string[],
    });

    useEffect(() => {
        if (token) fetchLinkData();
    }, [token]);

    const fetchLinkData = async () => {
        try {
            const response = await fetch(`/api/reviews/link/${token}`);
            if (response.ok) {
                const data = await response.json();
                setBranding(data.branding);
                setOrganization(data.organization);
                setClientName(data.client.name);
            } else {
                const data = await response.json();
                setError(data.error || 'Invalid or expired link');
            }
        } catch (error) {
            console.error('Failed to fetch link data:', error);
            setError('An error occurred. Please try again.');
            // Fallback to defaults
            setBranding({
                logo_url: null,
                primary_color: '#000000',
                secondary_color: '#ffffff',
                font_family: 'Inter',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'rating' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch(`/api/reviews/link/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitted(true);
                setFormData({ rating: 5, message: '', photos: [], videos: [] });
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                setError('Failed to submit review. Please try again.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Loading form...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300"
            style={{ backgroundColor: branding?.secondary_color || '#ffffff' }}
        >
            {/* Container */}
            <div className="max-w-2xl mx-auto w-full">
                {/* Header */}
                <div className="text-center mb-8 mt-4 sm:mt-8">
                    {branding?.logo_url && (
                        <img
                            src={branding.logo_url}
                            alt="Logo"
                            className="h-12 sm:h-16 max-w-full mx-auto mb-6 object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    )}
                    <h1
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 px-4"
                        style={{ fontFamily: branding?.font_family || 'Inter' }}
                    >
                        {organization?.name ? `${organization.name} Values Your Feedback` : 'Share Your Feedback'}
                    </h1>
                    <p
                        className="text-gray-600 text-sm sm:text-base px-4"
                        style={{ fontFamily: branding?.font_family || 'Inter' }}
                    >
                        Hi {clientName}, we'd love to hear about your experience!
                    </p>
                </div>

                {/* Form Card */}
                <Card className="shadow-lg border-0 bg-white/95 backdrop-blur">
                    <CardBody className="p-5 sm:p-8">
                        {submitted && (
                            <div className="mb-6">
                                <Alert 
                                    type="success" 
                                    title="Thank you for your review!" 
                                    message="Your review has been submitted and will be published after moderation." 
                                />
                            </div>
                        )}

                        {error && (
                            <div className="mb-6">
                                <Alert 
                                    type="error" 
                                    message={error} 
                                    onClose={() => setError('')} 
                                />
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

                            {/* Rating */}
                            <div>
                                <label
                                    className="block text-sm font-medium text-gray-900 mb-3"
                                    style={{ fontFamily: branding?.font_family || 'Inter' }}
                                >
                                    Rating
                                </label>
                                <div className="flex gap-2 sm:gap-3 flex-wrap">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({ ...prev, rating: star }))
                                            }
                                            className="transition-transform hover:scale-110 p-1 sm:p-2 -ml-1 sm:-ml-2 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                            style={{ '--tw-ring-color': branding?.primary_color || '#000' } as React.CSSProperties}
                                        >
                                            <Star
                                                className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${star <= formData.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-200'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label
                                    className="block text-sm font-medium text-gray-900 mb-2.5"
                                    style={{ fontFamily: branding?.font_family || 'Inter' }}
                                >
                                    Your Review
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Tell us about your experience..."
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-shadow resize-y min-h-[120px] text-base"
                                    style={{
                                        fontFamily: branding?.font_family || 'Inter',
                                    }}
                                />
                            </div>

                            {/* Media Uploads (Optional) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-900 mb-2.5"
                                        style={{ fontFamily: branding?.font_family || 'Inter' }}
                                    >
                                        Photos (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 transition-colors"
                                        onChange={(e) => {
                                            // In a real app, this would upload to S3/Cloudinary
                                            // For now we'll just store the mock string to demonstrate functionality
                                            if (e.target.files?.length) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    photos: Array.from(e.target.files!).map(f => URL.createObjectURL(f))
                                                }));
                                            }
                                        }}
                                        style={{ fontFamily: branding?.font_family || 'Inter' }}
                                    />
                                    {formData.photos.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-2">{formData.photos.length} photo(s) selected</p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-900 mb-2.5"
                                        style={{ fontFamily: branding?.font_family || 'Inter' }}
                                    >
                                        Videos (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        multiple
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 transition-colors"
                                        onChange={(e) => {
                                            if (e.target.files?.length) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    videos: Array.from(e.target.files!).map(f => URL.createObjectURL(f))
                                                }));
                                            }
                                        }}
                                        style={{ fontFamily: branding?.font_family || 'Inter' }}
                                    />
                                    {formData.videos.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-2">{formData.videos.length} video(s) selected</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3.5 sm:py-4 px-4 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] text-base"
                                style={{
                                    backgroundColor: branding?.primary_color || '#000000',
                                    fontFamily: branding?.font_family || 'Inter',
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </form>
                    </CardBody>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 pb-8 text-gray-500 text-xs sm:text-sm">
                    <p>Powered by ReviewHub</p>
                </div>
            </div>
        </div>
    );
}
