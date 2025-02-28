import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials } from '@/lib/auth/auth-utils';
import { createToken } from '@/lib/auth/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract login credentials
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials
    const user = await validateCredentials(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 使用新的异步createToken方法创建JWT令牌
    const token = await createToken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Set cookie (optional)
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Login successful',
        user,
        token
      },
      { status: 200 }
    );

    // Set HTTP-only cookie if needed
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 