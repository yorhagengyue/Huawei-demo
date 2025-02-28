import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';

// 需要验证令牌的路径
const PROTECTED_PATHS = [
  '/api/reports',
  '/api/user',
  '/api/admin'
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 如果不是受保护的路径，直接放行
  if (!PROTECTED_PATHS.some(prefix => path.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 尝试从cookie中获取令牌
  const token = request.cookies.get('auth_token')?.value;
  
  // 如果cookie中没有令牌，尝试从Authorization头获取
  const headerToken = request.headers.get('Authorization');
  const extractedHeaderToken = headerToken ? extractTokenFromHeader(headerToken) : null;
  
  // 使用cookie令牌或请求头令牌
  const authToken = token || extractedHeaderToken;

  // 如果没有令牌，返回未授权响应
  if (!authToken) {
    return NextResponse.json(
      { error: '未授权访问' },
      { status: 401 }
    );
  }

  // 验证令牌
  const user = verifyToken(authToken);
  if (!user) {
    // 清除无效的cookie令牌
    const response = NextResponse.json(
      { error: '无效或过期的令牌' },
      { status: 401 }
    );
    
    if (token) {
      response.cookies.delete('auth_token');
    }
    
    return response;
  }

  // 令牌有效，继续处理请求
  return NextResponse.next();
}

// 配置需要应用中间件的路径
export const config = {
  matcher: [
    '/api/reports/:path*',
    '/api/user/:path*',
    '/api/admin/:path*',
  ],
}; 