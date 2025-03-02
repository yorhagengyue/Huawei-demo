import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/auth-utils';

/**
 * Seed Data Creation API
 * Used only in development environment to initialize necessary base data
 */
export async function GET() {
  try {
    // Only allowed to run in development environment
    if (process.env.APP_ENV !== 'development') {
      return NextResponse.json({
        success: false,
        message: 'Seed API can only be used in development environment'
      }, { status: 403 });
    }

    console.log('Starting to create test data...');
    
    // Hash the test password
    const hashedPassword = await hashPassword('password123');

    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword, // Using hashed password
        name: 'Test User',
        emailVerified: true,
        isActive: true
      }
    });

    console.log('Created test user:', testUser.id);

    // Create some test reports
    const testReport = await prisma.report.create({
      data: {
        title: 'Test Report',
        description: 'This is a generated test report',
        category: 'TEST',
        status: 'pending',
        location: 'Singapore Central Business District',
        latitude: 1.290270,
        longitude: 103.851959,
        userId: testUser.id,
        media: {
          create: [
            {
              type: 'image',
              url: '/images/test-image-1.jpg'
            },
            {
              type: 'image',
              url: '/images/test-image-2.jpg'
            }
          ]
        }
      }
    });

    console.log('Created test report:', testReport.id);

    // Create some test files
    const testFile = await prisma.file.create({
      data: {
        fileName: 'TestFile.pdf',
        fileSize: 1024 * 1024, // 1MB
        fileType: 'pdf',
        contentType: 'application/pdf',
        storageType: 'local',
        storagePath: '/files/test-file.pdf',
        publicUrl: '/api/files/test-file.pdf',
        status: 'active',
        scanStatus: 'clean',
        tags: ['test', 'PDF', 'document'],
        userId: testUser.id,
        reportId: testReport.id
      }
    });

    console.log('Created test file:', testFile.id);

    // Return success message
    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        user: {
          id: testUser.id,
          username: testUser.username
        },
        report: {
          id: testReport.id,
          title: testReport.title
        },
        file: {
          id: testFile.id,
          fileName: testFile.fileName
        }
      }
    });
  } catch (error) {
    console.error('Error creating seed data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create seed data',
      error: error.message
    }, { status: 500 });
  }
} 