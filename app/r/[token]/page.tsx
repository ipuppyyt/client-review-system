'use client';

import { useEffect, useState, useRef, use } from 'react';
import { Loader2, UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';

interface Branding {
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    font_family: string;
}

interface OrganizationInfo {
    name: string;
}

const RATING_EMOJIS = [
    { value: 1, emoji: '😡', label: 'Terrible' },
    { value: 2, emoji: '🙁', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😍', label: 'Amazing' },
];

export default function ReviewSubmissionPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);

    const [branding, setBranding] = useState<Branding | null>(null);
    const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
    const [clientName, setClientName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        rating: 5,
        message: '',
        photos: [] as { file: Blob; preview: string }[],
        videos: [] as { file: File; preview: string }[],
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const successRef = useRef<HTMLDivElement>(null);
    const emojisRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (token) fetchLinkData();
    }, [token]);

    const fetchLinkData = async () => {
        try {
            const response = await fetch(`/api/reviews/link/${token}`);
            const data = await response.json();

            if (response.ok) {
                setBranding(data.branding);
                setOrganization(data.organization);
                setClientName(data.client.name);
            } else {
                if (data.error === 'Review already submitted for this link') {
                    setAlreadySubmitted(true);
                    setBranding(data.branding || {
                        logo_url: null,
                        primary_color: '#10b981', // Default green
                        secondary_color: '#f0fdf4',
                        font_family: 'Inter',
                    });
                } else {
                    setError(data.error || 'Invalid or expired link');
                }
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Initial GSAP animation
    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                containerRef.current.children,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
            );

            if (emojisRef.current && !alreadySubmitted && !submitted) {
                gsap.fromTo(
                    emojisRef.current.children,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(1.5)', delay: 0.4 }
                );
            }
        }
    }, [loading, alreadySubmitted, submitted]);

    // Success GSAP animation
    useEffect(() => {
        if (submitted && successRef.current) {
            gsap.fromTo(
                successRef.current,
                { scale: 0.9, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
            );
        }
    }, [submitted]);

    const compressImageToWebp = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('Failed to get canvas context');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject('Failed to compress image');
                    }, 'image/webp', 0.95); // High quality WebP
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'videos') => {
        const files = e.target.files;
        if (!files) return;

        const fileArray = Array.from(files);

        if (type === 'photos') {
            for (const file of fileArray) {
                try {
                    const webpBlob = await compressImageToWebp(file);
                    const preview = URL.createObjectURL(webpBlob);
                    setFormData(prev => ({ ...prev, photos: [...prev.photos, { file: webpBlob, preview }] }));
                } catch (error) {
                    console.error('Failed to compress image', error);
                }
            }
        } else {
            for (const file of fileArray) {
                const preview = URL.createObjectURL(file);
                setFormData(prev => ({ ...prev, videos: [...prev.videos, { file, preview }] }));
            }
        }
    };

    const removeFile = (index: number, type: 'photos' | 'videos') => {
        setFormData(prev => {
            const newState = { ...prev };
            URL.revokeObjectURL(newState[type][index].preview);
            newState[type] = newState[type].filter((_, i) => i !== index) as any;
            return newState;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('rating', formData.rating.toString());
            submitData.append('message', formData.message);

            formData.photos.forEach((photo, i) => {
                submitData.append('photos', photo.file, `photo_${i}.webp`);
            });
            formData.videos.forEach((video, i) => {
                submitData.append('videos', video.file, video.file.name);
            });

            const result: any = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `/api/reviews/link/${token}`);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(percentComplete);
                    }
                };

                xhr.onload = () => {
                    try {
                        const data = JSON.parse(xhr.response);
                        resolve({ ok: xhr.status >= 200 && xhr.status < 300, data });
                    } catch (e) {
                        resolve({ ok: false, data: { error: 'Invalid server response' } });
                    }
                };

                xhr.onerror = () => reject(new Error('Network Error'));

                xhr.send(submitData);
            });

            if (result.ok) {
                // Animate out form, then show success
                gsap.to(formRef.current, {
                    opacity: 0,
                    y: -20,
                    scale: 0.98,
                    duration: 0.4,
                    ease: 'power2.inOut',
                    onComplete: () => setSubmitted(true)
                });
            } else {
                setError(result.data.error || 'Failed to submit review.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
            setUploadProgress(0);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
                <Loader2 className="w-8 h-8 animate-spin text-base-content/60" />
            </div>
        );
    }

    if (error && !alreadySubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
                <div className="alert alert-error shadow-lg w-full max-w-md">
                    <div>
                        <AlertCircle className="w-12 h-12" />
                        <h2 className="text-2xl font-semibold mt-4">Link Invalid</h2>
                        <p className="mt-2 text-base-content/70">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const fontFamily = branding?.font_family || 'Inter';

    return (
        <div
            className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center bg-base-200 relative overflow-hidden"
            style={{ fontFamily }}
        >
            <div className="max-w-136 w-full relative z-10" ref={containerRef}>

                {/* Main Card */}
                <div className="card w-full bg-base-100 shadow-2xl border border-base-200 rounded-[2.5rem] overflow-hidden relative">

                    {/* Card Header */}
                    <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {branding?.logo_url && (
                                <img draggable={false} src={branding.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded-full bg-base-200 p-1 border border-base-300" />
                            )}
                            <span className="font-semibold text-base-content text-lg">
                                {organization?.name || 'Share Review'}
                            </span>
                        </div>
                    </div>

                    <div className="px-8 pb-8">
                        {alreadySubmitted ? (
                            <div className="py-12 text-center">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-base-content mb-3 tracking-tight">Review Received</h2>
                                <p className="text-base-content/70 text-base leading-relaxed">
                                    Hi {clientName}, you have already submitted your feedback. We truly appreciate your time!
                                </p>
                            </div>
                        ) : submitted ? (
                            <div ref={successRef} className="py-12 text-center">
                                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-bold text-base-content mb-4 tracking-tight">Thank You!</h2>
                                <p className="text-base-content/70 text-lg leading-relaxed">
                                    Your review has been successfully submitted. We appreciate your feedback to help us improve.
                                </p>
                            </div>
                        ) : (
                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">

                                {/* Title Area */}
                                <div className="text-center pt-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content mb-3">
                                        How was your experience?
                                    </h1>
                                    <p className="text-base-content/70 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                                        Hi {clientName}, your review will help us improve and provide a better service.
                                    </p>
                                </div>

                                {error && (
                                    <div className="alert alert-error">
                                        <div>
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{error}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Interactive Emoji Rating */}
                                <div className="py-4">
                                    <div className="flex justify-center items-center gap-2 sm:gap-4 relative" ref={emojisRef}>
                                        {RATING_EMOJIS.map(({ value, emoji, label }) => {
                                            const isSelected = formData.rating === value;
                                            return (
                                                <div key={value} className="relative flex flex-col items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, rating: value }))}
                                                        className={`btn btn-circle ${isSelected ? 'btn-primary scale-110 shadow-lg z-10' : 'btn-ghost'} w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300`}
                                                    >
                                                        <img
                                                            src={`https://emojicdn.elk.sh/${emoji}?style=apple`}
                                                            alt={label}
                                                            draggable={false}
                                                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                                                        />
                                                    </button>

                                                    <div className={`absolute -bottom-10 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-base-100 transition-all duration-300 ${isSelected ? 'opacity-100 translate-y-0 bg-primary' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                                                        {label}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="h-10" /> {/* Spacer for tooltip */}
                                </div>

                                {/* Textarea */}
                                <div>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                        className="textarea textarea-bordered textarea-lg w-full resize-none"
                                        placeholder="Share feedback..."
                                    />
                                </div>

                                {/* Media Uploads */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group cursor-pointer border border-dashed border-base-300 rounded-2xl p-4 text-center hover:border-primary transition-colors bg-base-100/50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => handleFileChange(e, 'photos')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <UploadCloud className="w-5 h-5 text-base-content/40 mx-auto mb-1 group-hover:text-primary transition-colors" />
                                        <span className="text-xs font-medium text-base-content/60">Photos</span>
                                    </div>
                                    <div className="relative group cursor-pointer border border-dashed border-base-300 rounded-2xl p-4 text-center hover:border-primary transition-colors bg-base-100/50">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            multiple
                                            onChange={(e) => handleFileChange(e, 'videos')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <UploadCloud className="w-5 h-5 text-base-content/40 mx-auto mb-1 group-hover:text-primary transition-colors" />
                                        <span className="text-xs font-medium text-base-content/60">Videos</span>
                                    </div>
                                </div>

                                {/* Previews */}
                                {(formData.photos.length > 0 || formData.videos.length > 0) && (
                                    <div className="flex gap-2 flex-wrap bg-base-200/50 p-3 rounded-2xl border border-base-300">
                                        {formData.photos.map((item, idx) => (
                                            <div key={`p-${idx}`} className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                                                <img draggable={false} src={item.preview} alt="Upload" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeFile(idx, 'photos')} className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.videos.map((item, idx) => (
                                            <div key={`v-${idx}`} className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm bg-black">
                                                <video src={item.preview} className="w-full h-full object-cover opacity-80" />
                                                <button type="button" onClick={() => removeFile(idx, 'videos')} className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 z-20">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary w-full py-4 px-6 rounded-2xl text-white font-semibold text-base transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden flex items-center justify-center gap-2"
                                >
                                    {submitting && (
                                        <div
                                            className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300 ease-out"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Submitting...'}
                                            </>
                                        ) : 'Submit Review'}
                                    </span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs font-medium text-base-content/40">
                        Powered by ReviewHub
                    </p>
                </div>
            </div>
        </div>
    );
}
