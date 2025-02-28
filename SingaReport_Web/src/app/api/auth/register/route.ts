import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/auth-utils';
import { createToken } from '@/lib/auth/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Add debug log
    console.log('Register request body:', JSON.stringify(body));
    
    // Extract user registration data
    const { 
      username, 
      name, 
      email, 
      password
    } = body;

    // Basic validation
    if (!username || !email || !password) {
      console.log('Register validation failed:', { username, email, password: !!password });
      return NextResponse.json(
        { error: 'Missing required fields. Username, email, and password are required.' },
        { status: 400 }
      );
    }

    try {
      // Register the user
      const newUser = await createUser({
        username,
        email,
        password,
        name
      });

      // 使用新的异步createToken方法创建JWT令牌
      const token = await createToken({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      });

      // Create response
      const response = NextResponse.json(
        { 
          success: true,
          message: 'User registration successful',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username
          },
          token
        },
        { status: 201 }
      );

      // Set HTTP-only cookie
      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    } catch (err: any) {
      // Handle specific errors from the createUser function
      return NextResponse.json(
        { error: err.message || 'Registration failed' },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 