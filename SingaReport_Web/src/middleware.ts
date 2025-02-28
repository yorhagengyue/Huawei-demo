import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';

// Paths that require token verification
const PROTECTED_PATHS = [
  '/api/reports',
  '/api/user',
  '/api/admin'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // If not a protected path, allow the request to proceed
  if (!PROTECTED_PATHS.some(prefix => path.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Try to get token from cookie
  const token = request.cookies.get('auth_token')?.value;
  
  // If no token in cookie, try to get from Authorization header
  const headerToken = request.headers.get('Authorization');
  const extractedHeaderToken = headerToken ? extractTokenFromHeader(headerToken) : null;
  
  // Use cookie token or header token
  const authToken = token || extractedHeaderToken;

  // If no token, return unauthorized response
  if (!authToken) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  try {
    // 异步验证令牌
    const user = await verifyToken(authToken);
    
    if (!user) {
      // 清除无效的cookie令牌
      const response = NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
      
      if (token) {
        response.cookies.delete('auth_token');
      }
      
      return response;
    }

    // 令牌有效,继续处理请求
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    // 验证失败,返回未授权响应
    const response = NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
    
    if (token) {
      response.cookies.delete('auth_token');
    }
    
    return response;
  }
}

// Configure paths to apply middleware
export const config = {
  matcher: [
    '/api/reports/:path*',
    '/api/user/:path*',
    '/api/admin/:path*',
  ],
}; 