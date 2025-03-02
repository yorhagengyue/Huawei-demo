import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateToken } from '@/lib/auth/jwt-utils';
import { verifyPassword } from '@/lib/auth/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate request data
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    // User does not exist
    if (!user) {
      return NextResponse.json(
        { error: 'Email or password is incorrect' },
        { status: 401 }
      );
    }
    
    // Check if password is valid
    // First try direct comparison (for seed data with plain text passwords)
    let isPasswordValid = user.password === password;
    
    // If direct comparison fails, try hash verification (for real user registrations)
    if (!isPasswordValid) {
      try {
        isPasswordValid = await verifyPassword(password, user.password);
      } catch (e) {
        console.warn('Password verification error:', e);
        // Error during verification, likely indicates the password is not hashed
        isPasswordValid = false;
      }
    }
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email or password is incorrect' },
        { status: 401 }
      );
    }

    // Check user status
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account has been disabled, please contact administrator' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'USER'
    });

    // Create response with token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Set authentication cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error during login process:', error);
    return NextResponse.json(
      { error: 'Server error occurred during login processing', details: error.message },
      { status: 500 }
    );
  }
} 