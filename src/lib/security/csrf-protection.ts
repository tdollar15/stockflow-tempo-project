import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// CSRF protection utility
export class CSRFProtection {
  // Generate a CSRF token
  static generateToken(userId: string): string {
    const secret = process.env.CSRF_SECRET || 'fallback_secret';
    const timestamp = Date.now().toString();
    
    // Create a hash combining user ID, timestamp, and secret
    const tokenData = `${userId}:${timestamp}:${secret}`;
    
    return createHash('sha256')
      .update(tokenData)
      .digest('hex');
  }

  // Validate CSRF token
  static validateToken(token: string, userId: string): boolean {
    if (!token) return false;

    const secret = process.env.CSRF_SECRET || 'fallback_secret';
    
    // Check tokens within the last 24 hours
    const currentTimestamp = Date.now();
    const oneDayAgo = currentTimestamp - (24 * 60 * 60 * 1000);

    for (let timestamp = currentTimestamp; timestamp >= oneDayAgo; timestamp -= (60 * 60 * 1000)) {
      const testTokenData = `${userId}:${timestamp}:${secret}`;
      const testToken = createHash('sha256')
        .update(testTokenData)
        .digest('hex');
      
      if (testToken === token) return true;
    }

    return false;
  }
}

// Middleware to protect routes with CSRF
export function csrfProtectionMiddleware(request: NextRequest) {
  // Skip for GET/HEAD requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return NextResponse.next();
  }

  // Extract CSRF token and user ID from headers
  const csrfToken = request.headers.get('x-csrf-token');
  const userId = request.headers.get('x-user-id');

  // Validate CSRF token
  if (!userId || !csrfToken || !CSRFProtection.validateToken(csrfToken, userId)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' }, 
      { status: 403 }
    );
  }

  return NextResponse.next();
}

// Utility to generate CSRF token for client-side use
export function generateClientCSRFToken(userId: string): string {
  return CSRFProtection.generateToken(userId);
}
