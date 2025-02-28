import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt-utils';

export async function GET(request: NextRequest) {
  try {
    // Get authentication token from cookie
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { 
          authenticated: false, 
          message: 'Authentication token not found' 
        }, 
        { status: 401 }
      );
    }

    // 异步验证令牌
    const decodedToken = await verifyToken(authToken);

    if (!decodedToken) {
      return NextResponse.json(
        { 
          authenticated: false, 
          message: 'Token is invalid or expired' 
        }, 
        { status: 401 }
      );
    }

    // Return user information (excluding sensitive data)
    return NextResponse.json(
      { 
        authenticated: true, 
        user: {
          id: decodedToken.id,
          email: decodedToken.email,
          username: decodedToken.username
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { 
        authenticated: false, 
        message: 'An error occurred during authentication' 
      }, 
      { status: 500 }
    );
  }
} 