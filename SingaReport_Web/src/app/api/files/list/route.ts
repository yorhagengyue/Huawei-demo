import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt-utils';

const DEMO_DATA_TAG = { isDemoData: true }; // Tag to indicate when demo data is returned

/**
 * Parse query parameters
 */
function parseQueryParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  return {
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: Math.min(parseInt(searchParams.get('limit') || '10', 10), 50), // Maximum 50 items
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc',
    fileType: searchParams.get('fileType') || undefined,
    search: searchParams.get('search') || undefined,
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    reportId: searchParams.get('reportId') || undefined,
    status: searchParams.get('status') || undefined,
    includeDemoData: searchParams.get('includeDemoData') === 'true',
  };
}

/**
 * Generate demo data for development purposes
 */
function generateDemoFileData(count = 10, userInfo = { id: 'demo-user', username: 'demouser' }) {
  const fileTypes = [
    { type: 'image/jpeg', ext: 'jpg' },
    { type: 'image/png', ext: 'png' },
    { type: 'application/pdf', ext: 'pdf' },
    { type: 'application/msword', ext: 'doc' },
    { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx' },
  ];
  
  const demoFiles = [];
  
  // Current date for reference
  const now = new Date();
  
  // 服务器端不能访问sessionStorage，所以这里只生成固定的演示文件
  
  // 生成演示文件
  for (let i = 1; i <= count; i++) {
    // Random file type
    const fileTypeIndex = Math.floor(Math.random() * fileTypes.length);
    const fileType = fileTypes[fileTypeIndex];
    
    // Random file size between 100KB and 5MB
    const fileSize = Math.floor(Math.random() * (5 * 1024 * 1024 - 100 * 1024) + 100 * 1024);
    
    // Random date within the last 30 days
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - Math.floor(Math.random() * 30));
    
    // Random updated date between created date and now
    const updatedAt = new Date(createdAt);
    updatedAt.setDate(createdAt.getDate() + Math.floor(Math.random() * (now.getDate() - createdAt.getDate() + 1)));
    
    // Random download count
    const downloadCount = Math.floor(Math.random() * 20);
    
    // Random scan status
    const scanStatuses = ['clean', 'scanning', 'flagged'];
    const scanStatus = scanStatuses[Math.floor(Math.random() * scanStatuses.length)];
    
    // Create file object
    demoFiles.push({
      id: `demo-file-${i}`,
      fileName: `Demo File ${i}.${fileType.ext}`,
      fileSize,
      fileType: fileType.type,
      contentType: fileType.type,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      scanStatus,
      downloadCount,
      status: 'active',
      tags: ['demo', 'sample', `type-${fileType.ext}`],
      reportId: i % 3 === 0 ? `demo-report-${Math.floor(i / 3)}` : null,
      lastDownloadedAt: downloadCount > 0 ? new Date().toISOString() : null,
      downloadUrl: `/api/files/demo-file-${i}/download`,
      viewUrl: `/api/files/demo-file-${i}`,
      canEdit: true,
      canDelete: true,
      isDemo: true,
      user: userInfo,
      ...DEMO_DATA_TAG
    });
  }
  
  return demoFiles;
}

/**
 * Get files accessible to the user
 */
async function getUserAccessibleFiles(
  userId: string,
  userRole: string,
  filters: any,
  pagination: any,
  sorting: any
) {
  // Build basic query conditions
  const where: any = {};
  
  // If not an admin, can only view own files and files from reports they have access to
  if (userRole !== 'ADMIN') {
    if (filters.reportId) {
      where.OR = [
        { userId },
        { 
          AND: [
            { reportId: filters.reportId },
            { userId }
          ]
        }
      ];
    } else {
      // No report ID specified, can only see own files
      where.userId = userId;
    }
  } else if (filters.reportId) {
    // Admin and reportId specified
    where.reportId = filters.reportId;
  }
  
  // Add other filter conditions
  if (filters.fileType) {
    where.fileType = filters.fileType;
  }
  
  if (filters.status) {
    where.status = filters.status;
  } else {
    // Default to not showing deleted files
    where.status = { not: 'DELETED' };
  }
  
  if (filters.search) {
    where.OR = [
      ...(where.OR || []),
      { fileName: { contains: filters.search, mode: 'insensitive' } },
      { tags: { has: filters.search } }
    ];
  }
  
  // Date range filtering
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    
    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }
  
  try {
    // Check if Prisma client is available
    if (!prisma) {
      console.error('Prisma client is undefined');
      throw new Error('Database connection not initialized');
    }
    
    // Get file list and total count
    const [files, totalCount] = await Promise.all([
      prisma.file.findMany({
        where,
        select: {
          id: true,
          fileName: true,
          fileSize: true,
          fileType: true,
          contentType: true,
          createdAt: true,
          updatedAt: true,
          scanStatus: true,
          downloadCount: true,
          status: true,
          tags: true,
          reportId: true,
          lastDownloadedAt: true,
          user: {
            select: {
              id: true,
              username: true
            }
          },
        },
        orderBy: { [sorting.sortBy]: sorting.sortOrder },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.file.count({ where })
    ]);
    
    // Query metadata for each file
    const filesWithMetadata = await Promise.all(
      files.map(async (file) => {
        // Query metadata for the file
        const fileMetadata = await prisma.file.findUnique({
          where: { id: file.id },
          select: { metadata: true, isDemo: true },
        });
        
        // Get download and view URLs
        const downloadUrl = `/api/files/${file.id}/download`;
        const viewUrl = `/api/files/${file.id}/view`;
        
        // Check if the user can edit and delete the file
        const canDelete = userRole === 'ADMIN' || (userId === file.user.id);
        const canEdit = userRole === 'ADMIN' || (userId === file.user.id);
        
        // Return the file with additional information
        return {
          ...file,
          isDemo: fileMetadata?.isDemo || false,
          metadata: fileMetadata?.metadata || {},
          downloadUrl,
          viewUrl,
          canDelete,
          canEdit,
        };
      })
    );
    
    return {
      files: filesWithMetadata,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / pagination.limit)
      }
    };
  } catch (error) {
    console.error('Error executing Prisma query:', error);
    throw error;
  }
}

/**
 * Handle file list request
 */
export async function GET(request: NextRequest) {
  try {
    // Check for demo mode first
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    // 1. Authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      if (isDemoMode) {
        // In demo mode, return demo data even without authentication
        console.log("Demo mode enabled: Returning demo file data for unauthenticated user");
        const demoFiles = generateDemoFileData(15);
        
        return NextResponse.json({
          files: demoFiles,
          pagination: {
            page: 1,
            limit: 20,
            totalItems: demoFiles.length,
            totalPages: 1
          },
          ...DEMO_DATA_TAG
        });
      }
      
      return NextResponse.json(
        { error: 'Authentication required to access files.' },
        { status: 401 }
      );
    }

    console.log('Verifying token:', token.substring(0, 10) + '...');
    const user = await verifyToken(token);
    if (!user) {
      if (isDemoMode) {
        // In demo mode, return demo data if token verification fails
        console.log("Demo mode enabled: Returning demo file data for invalid token");
        const demoFiles = generateDemoFileData(15);
        
        return NextResponse.json({
          files: demoFiles,
          pagination: {
            page: 1,
            limit: 20,
            totalItems: demoFiles.length,
            totalPages: 1
          },
          ...DEMO_DATA_TAG
        });
      }
      
      return NextResponse.json(
        { error: 'Your session has expired. Please log in again.' },
        { status: 401 }
      );
    }
    
    console.log('Token verified successfully, user:', user.email);
    
    // 2. Parse query parameters
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      fileType,
      search,
      startDate,
      endDate,
      reportId,
      status,
      includeDemoData
    } = parseQueryParams(request);
    
    // 3. Validate and clean sort fields
    const validSortFields = ['createdAt', 'updatedAt', 'fileSize', 'fileName', 'downloadCount'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    try {
      // 4. Get file list from database
      const result = await getUserAccessibleFiles(
        user.id,
        user.role,
        { fileType, search, startDate, endDate, reportId, status },
        { page, limit },
        { sortBy: actualSortBy, sortOrder }
      );
      
      // 5. File processing and permission filtering
      const processedFiles = result.files.map(file => {
        // Add file access URLs
        return {
          ...file,
          downloadUrl: `/api/files/${file.id}/download`,
          viewUrl: `/api/files/${file.id}`,
          canEdit: file.user.id === user.id || user.role === 'ADMIN',
          canDelete: file.user.id === user.id || user.role === 'ADMIN'
        };
      });
      
      // 6. Return results
      return NextResponse.json({
        files: processedFiles,
        pagination: result.pagination,
        filters: {
          fileType,
          search,
          startDate,
          endDate,
          reportId,
          status
        }
      });
    } catch (error) {
      // If database query fails and we're in development or demo mode is enabled, return demo data
      if (isDemoMode || process.env.NODE_ENV === 'development' || includeDemoData) {
        console.log("Returning demo file data due to database query failure:", error);
        
        // Generate demo file data
        const demoFiles = generateDemoFileData(15, { id: user.id, username: user.username || user.email });
        
        return NextResponse.json({
          files: demoFiles,
          pagination: {
            page,
            limit,
            totalItems: demoFiles.length,
            totalPages: 1
          },
          filters: {
            fileType,
            search,
            startDate,
            endDate,
            reportId,
            status
          },
          ...DEMO_DATA_TAG
        });
      }
      
      // If in production and not in demo mode, return the error
      console.error('Error fetching files:', error);
      return NextResponse.json(
        { error: 'Failed to fetch files. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in files list API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

/**
 * Handle preflight requests, configure CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 