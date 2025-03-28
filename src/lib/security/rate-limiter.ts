import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis for distributed rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  AUTH_ATTEMPTS: {
    maxRequests: 5,    // Max 5 login attempts
    windowInMinutes: 15 // Per 15-minute window
  },
  PASSWORD_RESET: {
    maxRequests: 3,    // Max 3 password reset requests
    windowInMinutes: 60 // Per hour
  },
  API_REQUESTS: {
    maxRequests: 100,  // Max 100 API requests
    windowInMinutes: 15 // Per 15-minute window
  }
};

// Generate a unique key for rate limiting
function generateRateLimitKey(identifier: string, type: keyof typeof RATE_LIMIT_CONFIG): string {
  return `rate_limit:${type}:${identifier}`;
}

// Check and apply rate limiting
export async function checkRateLimit(
  identifier: string, 
  type: keyof typeof RATE_LIMIT_CONFIG
): Promise<{ allowed: boolean; remainingRequests: number; resetTime: number }> {
  const config = RATE_LIMIT_CONFIG[type];
  const key = generateRateLimitKey(identifier, type);

  try {
    // Increment request count
    const currentCount = await redis.incr(key);
    
    // Set expiration if this is the first request
    if (currentCount === 1) {
      await redis.expire(key, config.windowInMinutes * 60);
    }

    // Check if exceeded limit
    const isAllowed = currentCount <= config.maxRequests;
    
    return {
      allowed: isAllowed,
      remainingRequests: Math.max(0, config.maxRequests - currentCount),
      resetTime: Date.now() + (config.windowInMinutes * 60 * 1000)
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open if Redis is unavailable
    return { 
      allowed: true, 
      remainingRequests: config.maxRequests, 
      resetTime: Date.now() 
    };
  }
}

// Middleware for rate limiting authentication attempts
export async function authRateLimitMiddleware(request: NextRequest) {
  // Extract IP or user identifier
  const identifier = request.ip || 'unknown';
  
  // Check rate limit for authentication
  const rateLimitResult = await checkRateLimit(identifier, 'AUTH_ATTEMPTS');
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Too many authentication attempts. Please try again later.',
        resetTime: rateLimitResult.resetTime
      }, 
      { status: 429 }  // Too Many Requests
    );
  }

  return NextResponse.next();
}

// Middleware for rate limiting password reset requests
export async function passwordResetRateLimitMiddleware(request: NextRequest) {
  const identifier = request.ip || 'unknown';
  
  const rateLimitResult = await checkRateLimit(identifier, 'PASSWORD_RESET');
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Too many password reset attempts. Please try again later.',
        resetTime: rateLimitResult.resetTime
      }, 
      { status: 429 }
    );
  }

  return NextResponse.next();
}
