import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt-utils';

/**
 * 解析查询参数
 */
function parseQueryParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  return {
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: Math.min(parseInt(searchParams.get('limit') || '10', 10), 50), // 最大50条
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
 * 获取用户有权访问的文件列表
 */
async function getUserAccessibleFiles(
  userId: string,
  userRole: string,
  filters: any,
  pagination: any,
  sorting: any
) {
  // 构建基本查询条件
  const where: any = {};
  
  // 如果不是管理员，只能查看自己的文件以及有权访问的报告文件
  if (userRole !== 'ADMIN') {
    if (filters.reportId) {
      // 如果指定了reportId，检查用户是否有权访问该报告
      // TODO: 需要实现报告权限检查逻辑
      // const hasReportAccess = await checkReportAccess(filters.reportId, userId);
      // if (hasReportAccess) {
      //   where.reportId = filters.reportId;
      // } else {
      //   // 如果没有报告访问权限，只能看到自己的文件
      //   where.userId = userId;
      // }
      
      // 暂时简化处理：只显示自己创建的报告文件
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
      // 没有指定报告ID，只能看自己的文件
      where.userId = userId;
    }
  } else if (filters.reportId) {
    // 管理员且指定了reportId
    where.reportId = filters.reportId;
  }
  
  // 添加其他筛选条件
  if (filters.fileType) {
    where.fileType = filters.fileType;
  }
  
  if (filters.status) {
    where.status = filters.status;
  } else {
    // 默认不显示已删除的文件
    where.status = { not: 'DELETED' };
  }
  
  if (filters.search) {
    where.OR = [
      ...(where.OR || []),
      { fileName: { contains: filters.search, mode: 'insensitive' } },
      { tags: { has: filters.search } }
    ];
  }
  
  // 日期范围筛选
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    
    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }
  
  // 执行查询
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
            username: true,
          }
        }
      },
      orderBy: { [sorting.sortBy]: sorting.sortOrder },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    }),
    prisma.file.count({ where })
  ]);
  
  return {
    files,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / pagination.limit)
    }
  };
}

/**
 * 处理文件列表请求
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 身份验证
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required to access files.' },
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
    
    // 2. 解析查询参数
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
    
    // 3. 验证和清理排序字段
    const validSortFields = ['createdAt', 'updatedAt', 'fileSize', 'fileName', 'downloadCount'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    // 4. 获取文件列表
    const result = await getUserAccessibleFiles(
      user.id,
      user.role,
      { fileType, search, startDate, endDate, reportId, status },
      { page, limit },
      { sortBy: actualSortBy, sortOrder }
    );
    
    // 5. 文件处理和权限过滤
    const processedFiles = result.files.map(file => {
      // 添加文件访问URL
      return {
        ...file,
        downloadUrl: `/api/files/${file.id}/download`,
        viewUrl: `/api/files/${file.id}`,
        canEdit: file.user.id === user.id || user.role === 'ADMIN',
        canDelete: file.user.id === user.id || user.role === 'ADMIN'
      };
    });
    
    // 6. 返回结果
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
    
  } catch (error) {
    console.error('Error fetching file list:', error);
    
    return NextResponse.json(
      { error: 'Server error occurred while fetching files' },
      { status: 500 }
    );
  }
}

/**
 * 处理预检请求，配置CORS
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