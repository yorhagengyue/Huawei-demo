import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth/jwt-utils';

// Create a new Prisma client instance
const prisma = new PrismaClient();

// Data source constants
const DATA_SOURCE = {
  DATABASE: 'database',
  DEMO: 'demo',
  ERROR: 'error'
};

// Report type definition
interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  severity: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Allow for additional properties
}

// Filter type for report queries
interface ReportFilters {
  userId?: string | null;
  status?: string | null;
  severity?: string | null;
  category?: string | null;
  location?: string | null;
}

/**
 * Generate demo reports for testing
 */
function getDemoReports(): Report[] {
  const statuses = ['open', 'in-progress', 'resolved'];
  const severities = ['low', 'medium', 'high'];
  const categories = [
    'infrastructure', 
    'cleanliness', 
    'facilities', 
    'safety', 
    'environment', 
    'noise', 
    'construction', 
    'other'
  ];
  const locations = ['North Region', 'Central Area', 'East Coast', 'Downtown'];
  
  return Array.from({ length: 10 }, (_, i) => {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: `demo-${i + 1}`,
      title: `Demo Report ${i + 1}`,
      description: `This is a sample report for demonstration purposes #${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      latitude: 1.35 + (Math.random() * 0.1),
      longitude: 103.8 + (Math.random() * 0.1),
      severity: severities[Math.floor(Math.random() * severities.length)],
      userId: i < 5 ? 'demo-user-1' : 'demo-user-2', // First 5 belong to user 1, rest to user 2
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString()
    };
  });
}

/**
 * Fetch reports from database
 */
async function fetchReportsFromDatabase(filters: ReportFilters): Promise<Report[]> {
  const { userId, status, severity, category, location } = filters;
  
  console.log('Fetching from database with filters:', filters);
  
  // Build where clause based on filters
  const where: any = {};
  
  if (userId) where.userId = userId;
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (category) where.category = category;
  if (location) where.location = { contains: location, mode: 'insensitive' };
  
  // Fetch reports from database
  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
  
  // Transform database results to match our Report interface
  return reports.map(report => ({
    id: report.id,
    title: report.title,
    description: report.description,
    category: report.category,
    status: report.status,
    location: report.location || '',
    latitude: report.latitude || undefined,
    longitude: report.longitude || undefined,
    severity: report.severity || 'medium', // Provide default if missing
    userId: report.userId,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    // Include any other properties that might be in the database
    ...report
  }));
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

/**
 * GET handler for reports
 * Optional query parameters: userId, status, severity, category, location
 */
export async function GET(request: NextRequest) {
  console.log('GET /api/reports received');
  
  const { searchParams } = new URL(request.url);
  
  // Log all search parameters for debugging
  console.log('All search parameters:', Object.fromEntries(searchParams.entries()));
  
  // Extract filters from query params
  const userIdFromParams = searchParams.get('userId');
  const status = searchParams.get('status');
  const severity = searchParams.get('severity');
  const category = searchParams.get('category');
  const location = searchParams.get('location');
  const forceDatabase = searchParams.get('forceDatabase') === 'true';
  const allUsers = searchParams.get('allUsers') === 'true';
  
  // For debugging: log detailed request information
  console.log('Request info:', {
    url: request.url,
    userId: userIdFromParams,
    userIdRaw: searchParams.get('userId'),
    status,
    severity,
    category,
    location,
    forceDatabase,
    allUsers
  });
  
  // Try to get user from authentication context if userId not in params
  let userId = userIdFromParams;
  if (!userId) {
    const user = getUserFromRequest(request);
    if (user && user.id) {
      // Only add user ID filter if not forcing all reports and not showing all users
      if (!forceDatabase && !allUsers) {
        userId = user.id;
        console.log(`Using authenticated user ID: ${userId} (from token)`);
      } else {
        console.log(`Found user ID ${user.id} but not using as filter (showing all users' reports)`);
        userId = null; // Clear userId when showing all reports
      }
    }
  } else if (allUsers) {
    console.log(`Ignoring provided userId ${userId} because allUsers=true parameter is set`);
    userId = null; // Ignore userId param if explicitly requesting all users
  } else {
    console.log(`Using userId from query params: ${userId}`);
  }
  
  try {
    // Demo mode check - unless forceDatabase is true
    const isDemoMode = !forceDatabase && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    console.log(`Demo mode: ${isDemoMode ? 'ON' : 'OFF'}`);
    console.log(`Force database: ${forceDatabase ? 'YES' : 'NO'}`);
    
    let reports: Report[] = [];
    let dataSource = DATA_SOURCE.DATABASE;
    
    if (isDemoMode) {
      // In demo mode, use demo data
      reports = getDemoReports();
      dataSource = DATA_SOURCE.DEMO;
      console.log(`Retrieved ${reports.length} demo reports`);
      
      // Apply filters in memory for demo data
      if (userId && userId.trim()) {
        reports = reports.filter(report => report.userId === userId);
        console.log(`Filtered for userId ${userId}, found ${reports.length} reports`);
      }
    } else {
      // In normal mode, fetch from database
      try {
        reports = await fetchReportsFromDatabase({ userId, status, severity, category, location });
        console.log(`Retrieved ${reports.length} reports from database`);
      } catch (error) {
        console.error('Database fetch error:', error);
        
        // Only fallback to demo data if not forcing database
        if (!forceDatabase) {
          console.log('Database error. Falling back to demo data.');
          reports = getDemoReports();
          dataSource = DATA_SOURCE.DEMO;
          
          // Apply filters for demo data
          if (userId && userId.trim()) {
            reports = reports.filter(report => report.userId === userId);
          }
          
          console.log(`Fallback: retrieved ${reports.length} demo reports`);
        } else {
          return NextResponse.json(
            { error: 'Failed to fetch reports from database', details: (error as Error).message },
            { status: 500 }
          );
        }
      }
    }
    
    // Apply common filters (already applied for database, only needed for demo data)
    if (isDemoMode) {
      if (status) reports = reports.filter(report => report.status === status);
      if (severity) reports = reports.filter(report => report.severity === severity);
      if (category) reports = reports.filter(report => report.category === category);
      if (location) reports = reports.filter(report => report.location.includes(location));
    }
    
    // Return reports with metadata about the source
    return NextResponse.json({
      reports,
      meta: {
        dataSource,
        filters: {
          userId: userId || null,
          status: status || null,
          severity: severity || null,
          category: category || null,
          location: location || null
        },
        total: reports.length
      }
    });
  } catch (error) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST handler for saving a new report
 */
export async function POST(request: NextRequest) {
  console.log('POST /api/reports received');
  
  try {
    const body = await request.json();
    console.log('Report submission received:', body);
    
    // Demo mode check
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    console.log(`Demo mode: ${isDemoMode ? 'ON' : 'OFF'}`);
    
    // Get authenticated user
    const authenticatedUser = getUserFromRequest(request);
    
    // Determine user ID with clear logging
    let userId = body.userId; // First check if provided in request body
    
    if (authenticatedUser && authenticatedUser.id) {
      // If authenticated user found, use that ID (overrides body)
      if (userId && userId !== authenticatedUser.id) {
        console.log(`Overriding provided userId ${userId} with authenticated user ID ${authenticatedUser.id}`);
      } else {
        console.log(`Using authenticated user ID: ${authenticatedUser.id}`);
      }
      userId = authenticatedUser.id;
    } else if (userId) {
      // If only body userId available, use that
      console.log(`Using userId from request body: ${userId}`);
    } else {
      // If no user ID available, generate anonymous ID
      userId = `anonymous-${Date.now()}`;
      console.log(`No userId provided or found in authentication, using generated: ${userId}`);
    }
    
    // Ensure userId is set in the report data
    body.userId = userId;
    console.log(`Final userId for report: ${userId}`);
    
    // In demo mode, don't actually save to database
    if (isDemoMode) {
      console.log('Demo mode: Simulating report save');
      
      // Simulate successful submission with a fake ID
      const fakeId = `demo-${Date.now()}`;
      
      return NextResponse.json({
        success: true,
        report: {
          id: fakeId,
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'open'
        },
        message: 'Report saved successfully (Demo Mode)'
      });
    }
    
    // Save report to database (non-demo mode)
    console.log('Saving report to database with userId:', userId);
    const savedReport = await saveReportToDatabase(body);
    
    return NextResponse.json({
      success: true,
      report: savedReport,
      message: 'Report saved successfully'
    });
  } catch (error) {
    console.error('Error saving report:', error);
    return NextResponse.json(
      { error: 'Failed to save report', details: (error as Error).message },
      { status: 500 }
    );
  }
} 