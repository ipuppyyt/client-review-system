'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { Star, Eye, EyeOff, Trash2, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/fluid-layout';
import { Card, CardBody } from '@/components/card';

interface Review {
    id: string;
    rating: number;
    message: string;
    photos: string[];
    videos: string[];
    is_published: boolean;
    created_at: string;
    client?: {
        name: string;
        company_name: string | null;
    };
}

type FilterType = 'all' | 'published' | 'pending';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');

    useEffect(() => { fetchReviews(); }, []);

    const fetchReviews = async () => {
        try {
            const session = await getSession();
            if (!session?.user?.organization_id) return;
            const response = await fetch(`/api/dashboard/reviews?org=${session.user.organization_id}`);
            if (response.ok) setReviews(await response.json());
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (reviewId: string, currentStatus: boolean) => {
        try {
            const response = await fetch('/api/dashboard/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, is_published: !currentStatus }),
            });
            if (response.ok) {
                setReviews(reviews.map((r) => r.id === reviewId ? { ...r, is_published: !currentStatus } : r));
            }
        } catch (error) {
            console.error('Failed to update review:', error);
        }
    };

    const deleteReview = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review? Deleting this review will re-allow the client to submit a new review using their link.')) return;
        try {
            const response = await fetch('/api/dashboard/reviews', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId }),
            });
            if (response.ok) setReviews(reviews.filter((r) => r.id !== reviewId));
        } catch (error) {
            console.error('Failed to delete review:', error);
        }
    };

    const filteredReviews = reviews.filter((r) => {
        if (filter === 'published') return r.is_published;
        if (filter === 'pending') return !r.is_published;
        return true;
    });

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= rating ? 'fill-primary text-primary' : 'text-base-content/40'}`}
                />
            ))}
        </div>
    );

    const filters: FilterType[] = ['all', 'published', 'pending'];

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader title="Reviews" description="Manage and approve customer reviews">
                <div className="flex flex-wrap gap-2">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={filter === f ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </PageHeader>

            <div className="space-y-3 sm:space-y-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardBody className="p-4 sm:p-6">
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-4 bg-base-200 rounded w-1/4" />
                                        <div className="h-3 bg-base-200 rounded w-3/4" />
                                        <div className="h-3 bg-base-200 rounded w-1/2" />
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <p className="text-base-content/70 text-sm sm:text-base">
                                {filter === 'all' ? 'No reviews yet' : `No ${filter} reviews`}
                            </p>
                        </CardBody>
                    </Card>
                ) : (
                    filteredReviews.map((review) => (
                        <Card key={review.id} className="hover:shadow-md dark:hover:shadow-black/20 transition-shadow">
                            <CardBody className="p-4 sm:p-6">
                                <div className="sm:flex sm:items-start sm:justify-between sm:gap-6">
                                    <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className="font-semibold text-base-content text-sm sm:text-base">
                                                {review.client?.name || 'Unknown Client'}
                                            </h3>
                                            <span className={`badge badge-sm ${review.is_published ? 'badge-success' : 'badge-warning'}`}>
                                                {review.is_published ? 'Published' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            {renderStars(review.rating)}
                                            <span className="text-xs text-base-content/60">{review.rating}.0</span>
                                        </div>
                                        <p className="text-base-content/80 text-sm mb-3 leading-relaxed">{review.message}</p>

                                        {(review.photos?.length > 0 || review.videos?.length > 0) && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {review.photos?.map((src, i) => (
                                                    <img key={`p-${i}`} src={src} alt="Review upload" className="w-16 h-16 object-cover rounded-lg border border-base-200" />
                                                ))}
                                                {review.videos?.map((src, i) => (
                                                    <video key={`v-${i}`} src={src} className="w-16 h-16 object-cover rounded-lg border border-base-200 bg-black" />
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 sm:flex-col shrink-0 border-t sm:border-t-0 border-base-200 dark:border-base-300 pt-4 sm:pt-0 mt-4 sm:mt-0">
                                        <button
                                            onClick={() => togglePublish(review.id, review.is_published)}
                                            className={`btn btn-sm w-full sm:w-auto ${review.is_published ? 'btn-success' : 'btn-primary'} flex items-center justify-center gap-2`}
                                            title={review.is_published ? 'Hide review' : 'Publish review'}
                                        >
                                            {review.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            <span className="text-xs font-medium sm:hidden">
                                                {review.is_published ? 'Hide' : 'Publish'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => deleteReview(review.id)}
                                            className="btn btn-sm btn-error w-full sm:w-auto flex items-center justify-center gap-2"
                                            title="Delete review"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-xs font-medium sm:hidden">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
