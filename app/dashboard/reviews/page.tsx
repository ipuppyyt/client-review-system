'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { Star, Eye, EyeOff, Trash2, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/fluid-layout';
import { Card, CardBody } from '@/components/card';

interface Review {
    id: string;
    customer_name: string;
    rating: number;
    message: string;
    is_published: boolean;
    created_at: string;
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
        if (!confirm('Are you sure you want to delete this review?')) return;
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
                    className={`w-3.5 h-3.5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
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
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                                ${filter === f
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
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
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
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
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                                {review.customer_name}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                                ${review.is_published
                                                    ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                                                    : 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400'
                                                }`}>
                                                {review.is_published ? 'Published' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            {renderStars(review.rating)}
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{review.rating}.0</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">{review.message}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 sm:flex-col shrink-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 pt-4 sm:pt-0 mt-4 sm:mt-0">
                                        <button
                                            onClick={() => togglePublish(review.id, review.is_published)}
                                            className={`flex-1 sm:flex-none p-2.5 rounded-lg transition-colors flex items-center justify-center gap-2
                                                ${review.is_published
                                                    ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/70 border border-green-200 dark:border-green-800'
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                                }`}
                                            title={review.is_published ? 'Hide review' : 'Publish review'}
                                        >
                                            {review.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            <span className="text-xs font-medium sm:hidden">
                                                {review.is_published ? 'Hide' : 'Publish'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => deleteReview(review.id)}
                                            className="flex-1 sm:flex-none p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/70 border border-red-200 dark:border-red-800 transition-colors flex items-center justify-center gap-2"
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
