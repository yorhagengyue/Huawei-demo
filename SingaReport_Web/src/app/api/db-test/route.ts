import { NextResponse } from 'next/server';
import { prisma, testConnection } from '@/lib/db/prisma';

/**
 * Database Connection Test API Endpoint
 * Used for diagnosing database connection issues
 */
export async function GET() {
  try {
    console.log('Starting database connection test...');
    
    // Test if Prisma instance exists
    if (!prisma) {
      console.error('Prisma instance not initialized');
      return NextResponse.json({
        success: false,
        error: 'Prisma instance not initialized',
        prismaExists: false
      }, { status: 500 });
    }
    
    // Test database connection
    const connectionSuccess = await testConnection();
    
    if (!connectionSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Database connection test failed',
        prismaExists: true,
        connectionTested: true
      }, { status: 500 });
    }
    
    // Try running simple queries
    try {
      // First check the User table
      console.log('Attempting to query User table...');
      const userCount = await prisma.user.count();
      
      // Then check the File table
      console.log('Attempting to query File table...');
      const fileCount = await prisma.file.count();
      
      return NextResponse.json({
        success: true,
        prismaExists: true,
        connectionTested: true,
        database: {
          users: userCount,
          files: fileCount
        }
      }, { status: 200 });
    } catch (queryError) {
      console.error('Query test failed:', queryError);
      return NextResponse.json({
        success: false,
        error: `Query test failed: ${queryError.message}`,
        prismaExists: true,
        connectionTested: true
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error occurred during database test:', error);
    return NextResponse.json({
      success: false,
      error: `Unhandled error: ${error.message}`
    }, { status: 500 });
  }
} 