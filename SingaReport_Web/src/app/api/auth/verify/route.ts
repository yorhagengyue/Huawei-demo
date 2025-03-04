import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt-utils';

export async function GET(request: NextRequest) {
  try {
    // Try to get token from multiple sources
    // 1. First try to get from cookies
    let authToken = request.cookies.get('auth_token')?.value;
    
    // 2. If no token in cookies, try from Authorization header
    if (!authToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('Token found in Authorization header');
      }
    }

    // 3. If token not found anywhere, return unauthenticated
    if (!authToken) {
      console.log('Authentication token not found in cookies or headers');
      return NextResponse.json(
        { 
          authenticated: false, 
          message: 'Authentication token not found' 
        }, 
        { status: 401 }
      );
    }

    // Verify token
    const decodedToken = await verifyToken(authToken);

    if (!decodedToken) {
      console.log('Token is invalid or expired');
      return NextResponse.json(
        { 
          authenticated: false, 
          message: 'Token is invalid or expired' 
        }, 
        { status: 401 }
      );
    }

    console.log('Token verification successful for user:', decodedToken.email);
    
    // Authentication successful, return user info (excluding sensitive data)
    const response = NextResponse.json(
      { 
        authenticated: true, 
        user: {
          id: decodedToken.id,
          email: decodedToken.email,
          username: decodedToken.username,
          role: decodedToken.role || 'USER'
        },
        token: authToken // Also return token for client storage
      }, 
      { status: 200 }
    );
    
    // Ensure cookie is set
    response.cookies.set({
      name: 'auth_token',
      value: authToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
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