import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth/jwt-utils';

// Create a new Prisma client instance
const prisma = new PrismaClient();

// Data source constants
const DATA_SOURCE = {
  DATABASE: 'database',
  ERROR: 'error'
};

// Fetch reports from database using Prisma
async function fetchReportsFromDatabase(category?: string, status?: string) {
  const filters: any = {};
  
  if (category) {
    filters.category = category;
  }
  
  if (status) {
    filters.status = status;
  }
  
  try {
    console.log('Fetching from database with filters:', filters);
    
    // Query database with filters
    const reports = await prisma.report.findMany({
      where: filters,
      include: {
        media: true,
        // 已移除 user 关系，因为该关系不再存在
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${reports.length} reports in database`);
    return reports;
  } catch (error) {
    console.error('Error fetching from database:', error);
    throw error;
  }
}

// Save report to database using Prisma
async function saveReportToDatabase(reportData: any, userId: string = 'anonymous') {
  try {
    console.log('Saving report to database:', { title: reportData.title, userId });
    
    // 构建与数据库模型匹配的数据结构
    // 注意：Report 模型中只有 userId 字段，没有直接链接到 User 模型
    const data = {
      title: reportData.title || '',
      description: reportData.description || '',
      category: reportData.category || 'other',
      status: 'open', // Default status for new reports
      location: reportData.location || '',
      // 确保数值类型正确
      latitude: reportData.latitude ? parseFloat(String(reportData.latitude)) : null,
      longitude: reportData.longitude ? parseFloat(String(reportData.longitude)) : null, 
      severity: reportData.severity || 'medium', // 现在我们已确认 severity 字段存在
      userId: userId || 'anonymous',
      isDemo: false
    };
    
    console.log('Prepared data for Prisma:', data);
    
    // Create report record in database
    const savedReport = await prisma.report.create({
      data,
      include: {
        media: true // 只包含确实存在的关系
      }
    });
    
    console.log('Report saved to database with ID:', savedReport.id);
    return savedReport;
  } catch (error) {
    console.error('Error saving report to database:', error);
    throw error;
  }
}

// GET reports API endpoint
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');
    const statusParam = searchParams.get('status');
    
    // Convert null to undefined for our function
    const category = categoryParam ?? undefined;
    const status = statusParam ?? undefined;
    
    // Log request info
    console.log('GET /api/reports', { 
      params: { category, status }
    });
    
    try {
      // Fetch reports from database
      const reports = await fetchReportsFromDatabase(category, status);
      
      // 结构化响应，确保与前端期望的格式匹配
      return NextResponse.json({
        success: true,
        reports: reports,
        source: DATA_SOURCE.DATABASE,
        timestamp: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Database error when fetching reports:', dbError);
      
      // Return error response
      return NextResponse.json(
        { error: 'Database error', message: (dbError as Error).message, source: DATA_SOURCE.ERROR },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json(
      { error: 'Failed to process request', message: (error as Error).message, source: DATA_SOURCE.ERROR },
      { status: 500 }
    );
  }
}

// POST report API endpoint
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('POST /api/reports', { 
      data: { title: data.title, category: data.category }
    });
    
    // Check required fields
    const requiredFields = ['title', 'category', 'description', 'location'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', fields: missingFields },
        { status: 400 }
      );
    }
    
    try {
      // Get authenticated user (if any)
      const user = await getUserFromRequest(request);
      const userId = user?.id || 'anonymous';
      
      // Save report to database
      const savedReport = await saveReportToDatabase(data, userId);
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Report submitted successfully',
        report: savedReport,
        source: DATA_SOURCE.DATABASE
      });
    } catch (dbError) {
      console.error('Database error when saving report:', dbError);
      
      // Return error response
      return NextResponse.json(
        { error: 'Failed to save report', message: (dbError as Error).message, source: DATA_SOURCE.ERROR },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/reports:', error);
    return NextResponse.json(
      { error: 'Failed to process request', message: (error as Error).message, source: DATA_SOURCE.ERROR },
      { status: 500 }
    );
  }
} 