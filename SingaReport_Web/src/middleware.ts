import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';

// Development mode bypass flag (enables skipping auth verification in dev mode)
const DEV_AUTH_BYPASS = true;

// Paths that require token verification
const PROTECTED_PATHS = [
  '/api/reports',
  '/api/user',
  '/api/admin'
];

// Public API paths that don't require authentication
const PUBLIC_API_PATHS = [
  '/api/demo',
  '/api/auth'
];

// Helper function to redirect to login with return URL
function redirectToLogin(request: NextRequest) {
  const returnUrl = encodeURIComponent(request.nextUrl.pathname);
  const redirectUrl = new URL(`/login?returnUrl=${returnUrl}`, request.url);
  console.log(`[MIDDLEWARE-DEBUG] Redirecting to: ${redirectUrl.pathname}${redirectUrl.search}`);
  return NextResponse.redirect(redirectUrl);
}

// Handle report-related routes (/api/reports/*)
async function handleReportRoutes(request: NextRequest) {
  console.log('[MIDDLEWARE-DEBUG] Checking report route:', request.nextUrl.pathname);
  
  // Check if in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  console.log('[MIDDLEWARE-DEBUG] Development mode:', isDevelopment);
  
  // Check if demo mode is enabled
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  console.log('[MIDDLEWARE-DEBUG] Demo mode:', isDemoMode);
  
  // Only bypass auth in development mode with demo mode enabled
  const bypassAuth = isDevelopment && isDemoMode;
  console.log('[MIDDLEWARE-DEBUG] Auth bypass enabled:', bypassAuth);
  
  // For API requests, just let them pass through to be handled by the API route
  if (request.nextUrl.pathname.startsWith('/api/reports')) {
    console.log('[MIDDLEWARE-DEBUG] API route, passing through:', request.nextUrl.pathname);
    return NextResponse.next();
  }
  
  if (bypassAuth) {
    console.log('[MIDDLEWARE-DEBUG] DEVELOPMENT MODE - bypassing authentication for:', request.nextUrl.pathname);
    return NextResponse.next();
  }
  
  // Check for auth token in cookies
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    console.log('[MIDDLEWARE-DEBUG] No auth token found, redirecting to login');
    return redirectToLogin(request);
  }
  
  // Token verification is now done in the API routes
  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`[MIDDLEWARE-DEBUG] Processing request for path: ${path}`);
  
  // Handle report routes first
  const reportRouteResult = await handleReportRoutes(request);
  if (reportRouteResult) {
    return reportRouteResult;
  }
  
  // Continue with existing middleware logic for API routes...
  
  console.log(`[MIDDLEWARE-DEBUG] Development mode: ${process.env.NODE_ENV === 'development'}`);
  console.log(`[MIDDLEWARE-DEBUG] Auth bypass enabled: ${DEV_AUTH_BYPASS}`);
  
  // Check if path is in the public API whitelist
  for (const publicPath of PUBLIC_API_PATHS) {
    if (path.startsWith(publicPath)) {
      console.log(`[MIDDLEWARE-DEBUG] Allowing public access to: ${path}`);
      return NextResponse.next();
    }
  }
  
  // If not a protected path, allow the request to proceed
  if (!PROTECTED_PATHS.some(prefix => path.startsWith(prefix))) {
    console.log(`[MIDDLEWARE-DEBUG] Path ${path} is not protected, allowing access`);
    return NextResponse.next();
  }

  // For development mode with bypass flag enabled, skip auth
  if (process.env.NODE_ENV === 'development' && DEV_AUTH_BYPASS) {
    console.log(`[MIDDLEWARE-DEBUG] DEVELOPMENT MODE - bypassing authentication for: ${path}`);
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set('x-user', JSON.stringify({
      id: 'dev-user-id',
      username: 'dev-user',
      email: 'dev@example.com',
      role: 'admin', // Give admin access in dev mode
    }));
    
    return NextResponse.next({
      request: {
        headers: modifiedHeaders,
      },
    });
  }

  console.log(`[MIDDLEWARE-DEBUG] Path ${path} requires authentication, checking token`);
  
  // Dump all request headers for debugging
  console.log('[MIDDLEWARE-DEBUG] Request headers:');
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'authorization') {
      console.log(`[MIDDLEWARE-DEBUG]   ${key}: Bearer [REDACTED]`);
    } else {
      console.log(`[MIDDLEWARE-DEBUG]   ${key}: ${value}`);
    }
  });
  
  // Try to get token from authorization header
  const authHeader = request.headers.get('authorization');
  console.log(`[MIDDLEWARE-DEBUG] Authorization header present: ${!!authHeader}`);
  
  let headerToken = null;
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      headerToken = authHeader.substring(7);
      console.log(`[MIDDLEWARE-DEBUG] Extracted token from header (first 10 chars): ${headerToken.substring(0, 10)}...`);
    } else {
      console.log(`[MIDDLEWARE-DEBUG] Authorization header does not use Bearer scheme: ${authHeader.substring(0, 10)}...`);
    }
  }
  
  // Try to get token from cookie
  const cookieToken = request.cookies.get('auth_token')?.value;
  console.log(`[MIDDLEWARE-DEBUG] Cookie token present: ${!!cookieToken}`);
  if (cookieToken) {
    console.log(`[MIDDLEWARE-DEBUG] Cookie token (first 10 chars): ${cookieToken.substring(0, 10)}...`);
  }
  
  // Enumerate all cookies for debugging
  console.log('[MIDDLEWARE-DEBUG] All cookies:');
  request.cookies.getAll().forEach(cookie => {
    console.log(`[MIDDLEWARE-DEBUG]   ${cookie.name}: ${cookie.value.substring(0, Math.min(10, cookie.value.length))}...`);
  });
  
  // Use header token or cookie token
  const token = headerToken || cookieToken;

  // If no token found, return unauthorized
  if (!token) {
    console.log(`[MIDDLEWARE-DEBUG] No auth token found in request, returning 401`);
    return NextResponse.json(
      { success: false, message: 'Unauthorized access - No token provided' },
      { status: 401 }
    );
  }

  try {
    // 验证令牌
    console.log(`[MIDDLEWARE-DEBUG] Verifying token: ${token.substring(0, 10)}...`);
    const payload = await verifyToken(token);
    
    if (!payload) {
      console.log(`[MIDDLEWARE-DEBUG] Token verification failed (null payload), returning 401`);
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Token format verification
    try {
      const tokenParts = token.split('.');
      console.log(`[MIDDLEWARE-DEBUG] Token has ${tokenParts.length} parts (should be 3 for valid JWT)`);
      
      if (tokenParts.length !== 3) {
        console.log(`[MIDDLEWARE-DEBUG] Token format is invalid, doesn't have 3 parts`);
        return NextResponse.json(
          { success: false, message: 'Invalid token format' },
          { status: 401 }
        );
      }
    } catch (parseError) {
      console.error(`[MIDDLEWARE-DEBUG] Error parsing token format:`, parseError);
    }

    // 令牌验证成功
    console.log(`[MIDDLEWARE-DEBUG] Token verification successful for user:`, payload);
    
    // 在请求上下文中添加用户信息，以便后续处理
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set('x-user', JSON.stringify(payload));
    
    console.log(`[MIDDLEWARE-DEBUG] Adding user to request headers, proceeding to API`);
    
    return NextResponse.next({
      request: {
        headers: modifiedHeaders,
      },
    });
  } catch (error) {
    console.error(`[MIDDLEWARE-DEBUG] Token verification error:`, error);
    
    // 验证失败返回未授权
    return NextResponse.json(
      { success: false, message: 'Authentication failed - Token verification error' },
      { status: 401 }
    );
  }
}

// Configure paths to apply middleware
export const config = {
  matcher: [
    '/api/reports/:path*',
    '/api/user/:path*',
    '/api/admin/:path*',
    '/report/create/:path*',
    '/report/create'
  ],
}; 