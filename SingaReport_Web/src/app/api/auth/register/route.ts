import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract user registration data
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      address, 
      postalCode, 
      preferredLanguage, 
      agreeTerms, 
      receiveUpdates 
    } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !password || !address || !postalCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!agreeTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms of service' },
        { status: 400 }
      );
    }

    try {
      // Register the user
      const newUser = registerUser({
        firstName,
        lastName,
        email,
        phone,
        password,
        address,
        postalCode,
        preferredLanguage,
        receiveUpdates: !!receiveUpdates
      });

      // In a real app, this would include creating a session or JWT token
      return NextResponse.json(
        { 
          success: true,
          message: 'User registered successfully',
          user: newUser
        },
        { status: 201 }
      );
    } catch (err: any) {
      // Handle specific errors from the registerUser function
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