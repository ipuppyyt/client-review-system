import Redis from 'ioredis';
import { env } from '@/config/env';

// Prevent multiple instances of Redis in development
const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    // Add any optimal caching settings
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Cache utility functions
export const cache = {
    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            console.error(`Redis cache GET error for key ${key}:`, error);
            return null;
        }
    },
    
    async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
        try {
            const data = JSON.stringify(value);
            if (ttlSeconds > 0) {
                await redis.set(key, data, 'EX', ttlSeconds);
            } else {
                await redis.set(key, data);
            }
        } catch (error) {
            console.error(`Redis cache SET error for key ${key}:`, error);
        }
    },
    
    async del(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (error) {
            console.error(`Redis cache DEL error for key ${key}:`, error);
        }
    },

    async delPattern(pattern: string): Promise<void> {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error(`Redis cache DEL PATTERN error for pattern ${pattern}:`, error);
        }
    }
};

// Key generation utilities for standardized cache keys
export const cacheKeys = {
    // Public routes (needs to be invalidated when branding/org changes)
    publicBranding: (slug: string) => `public:branding:${slug}`,
    publicReviews: (slug: string) => `public:reviews:${slug}`,
    
    // Dashboard routes (needs to be invalidated when data changes)
    dashboardReviews: (orgId: string) => `dashboard:reviews:${orgId}`,
    dashboardStats: (orgId: string) => `dashboard:stats:${orgId}`,
    dashboardBranding: (orgId: string) => `dashboard:branding:${orgId}`,
    dashboardOrganization: (orgId: string) => `dashboard:org:${orgId}`,
};
