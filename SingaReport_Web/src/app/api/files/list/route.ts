import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt-utils';

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
    status: searchParams.get('status') || undefined
  };
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
    
    // 获取文件列表和总数
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
    // 1. Authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required to access files.' },
        { status: 401 }
      );
    }

    console.log('Verifying token:', token.substring(0, 10) + '...');
    const user = await verifyToken(token);
    if (!user) {
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
      status
    } = parseQueryParams(request);
    
    // 3. Validate and clean sort fields
    const validSortFields = ['createdAt', 'updatedAt', 'fileSize', 'fileName', 'downloadCount'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    try {
      // 4. Get file list
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
        },
        sorting: {
          sortBy: actualSortBy,
          sortOrder
        }
      });
    } catch (dbError) {
      console.error('Error fetching file list:', dbError);
      return NextResponse.json(
        { error: 'Database error occurred while fetching files', details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in GET route handler:', error);
    
    return NextResponse.json(
      { error: 'Server error occurred while processing your request', details: error.message },
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
      'Access-Max-Age': '86400',
    },
  });
} 