import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';
import { verifyPassword, hashPassword } from '@/lib/auth/auth-utils';

// Change password
export async function POST(request: NextRequest) {
  try {
    // Verify user identity
    const token = request.cookies.get('auth_token')?.value 
                || extractTokenFromHeader(request.headers.get('Authorization'));
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to change your password.' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Your session has expired. Please log in again.' },
        { status: 401 }
      );
    }

    // Parse request data
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    // Basic validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both current password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Your new password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Query user
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'Unable to find your account. Please contact support.' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, userRecord.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect. Please try again.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'We encountered an error while changing your password. Please try again later.' },
      { status: 500 }
    );
  }
}