import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';

// Get user information
export async function GET(request: NextRequest) {
  try {
    // Verify user identity
    const token = request.cookies.get('auth_token')?.value 
                || extractTokenFromHeader(request.headers.get('Authorization'));
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Query user information
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        address: true,
        postalCode: true,
        preferredLanguage: true,
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: true,
        twoFactorEnabled: true,
        isActive: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // Include the count of reports created by the user
        _count: {
          select: {
            reports: true
          }
        }
      }
    });

    // If the user doesn't exist
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user information
    return NextResponse.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Error getting user information:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user information
export async function PATCH(request: NextRequest) {
  try {
    // Verify user identity
    const token = request.cookies.get('auth_token')?.value 
                || extractTokenFromHeader(request.headers.get('Authorization'));
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse request data
    const body = await request.json();
    const { 
      name, 
      phone, 
      avatar, 
      bio, 
      address, 
      postalCode, 
      preferredLanguage,
      notificationsEnabled,
      emailNotifications,
      pushNotifications,
      smsNotifications
    } = body;
    
    // Provide at least one field
    if (!name && !phone && !avatar && !bio && !address && !postalCode && 
        !preferredLanguage && notificationsEnabled === undefined && 
        emailNotifications === undefined && pushNotifications === undefined && 
        smsNotifications === undefined) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar && { avatar }),
        ...(bio && { bio }),
        ...(address && { address }),
        ...(postalCode && { postalCode }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(smsNotifications !== undefined && { smsNotifications })
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        address: true,
        postalCode: true,
        preferredLanguage: true,
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: true,
        twoFactorEnabled: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user information:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 