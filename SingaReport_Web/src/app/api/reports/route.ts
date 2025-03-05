import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';

// Get report list
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query conditions
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    // Get total number of reports
    const total = await prisma.report.count({ where });

    // Query report list
    const reports = await prisma.report.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          }
        },
        media: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Return results
    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting report list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new report
export async function POST(request: NextRequest) {
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
    const { title, description, category, location, latitude, longitude, mediaUrls, isDemo } = body;

    // Basic validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description and category are required' },
        { status: 400 }
      );
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        userId: user.id,
        isDemo: isDemo === 'true' || isDemo === true,
        // If there are media files, create associations
        ...(mediaUrls && mediaUrls.length > 0 && {
          media: {
            create: mediaUrls.map((url: string) => ({
              type: url.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
              url,
              isDemo: isDemo === 'true' || isDemo === true
            }))
          }
        })
      },
      include: {
        media: true
      }
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Report created successfully',
        data: report,
        id: report.id,
        reportId: report.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 