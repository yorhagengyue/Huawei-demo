import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt-utils';
import { prisma } from '@/lib/db/prisma';

/**
 * 记录文件访问日志
 */
async function logFileAccess({
  fileId,
  userId,
  ipAddress,
  userAgent,
  accessType = 'DOWNLOAD',
  isAuthorized = true,
  errorMessage = null,
}: {
  fileId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  accessType?: 'VIEW' | 'DOWNLOAD' | 'METADATA';
  isAuthorized?: boolean;
  errorMessage?: string | null;
}) {
  try {
    const accessLog = await prisma.fileAccessLog.create({
      data: {
        fileId,
        userId,
        ipAddress,
        userAgent,
        accessType,
        isAuthorized,
        errorMessage,
        requestId: `req-${uuidv4().substring(0, 8)}`
      }
    });
    
    console.log(`File download logged. ID: ${accessLog.id}`);
    return accessLog;
  } catch (error) {
    console.error('Failed to log file download:', error);
    return null;
  }
}

/**
 * 获取客户端IP地址
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.ip || '127.0.0.1';
}

/**
 * 检查用户是否有下载文件的权限
 */
async function checkDownloadPermission(fileId: string, userId: string, userRole: string) {
  // 获取文件信息
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      scanResult: true,
    }
  });
  
  if (!file) {
    return { allowed: false, reason: 'File not found', file: null };
  }
  
  // 检查文件是否被标记为恶意软件
  if (file.scanStatus === 'infected') {
    return { allowed: false, reason: 'File is infected with malware', file };
  }
  
  // 检查用户是否是文件所有者或管理员
  const isOwner = file.userId === userId;
  const isAdmin = userRole === 'ADMIN';
  
  if (isOwner || isAdmin) {
    return { allowed: true, reason: null, file };
  }
  
  // 非所有者和非管理员的情况下，检查报告共享权限
  if (file.reportId) {
    // TODO: 实现报告共享逻辑
    // const hasAccess = await checkReportAccess(file.reportId, userId);
    // if (hasAccess) {
    //   return { allowed: true, reason: null, file };
    // }
  }
  
  return { allowed: false, reason: 'Not authorized to download this file', file };
}

/**
 * 处理文件下载请求
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Extract file ID from params
    const { fileId } = params;
    
    // Check if this is a demo file
    const isDemoFile = fileId.startsWith('demo-file-');
    
    // For demo files, return a placeholder file
    if (isDemoFile) {
      return handleDemoFileDownload(fileId);
    }
    
    // Authenticate user
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required to download files.' },
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
    
    // Find file in database
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        user: {
          select: {
            id: true
          }
        }
      }
    });
    
    // Check if file exists
    if (!file) {
      return NextResponse.json(
        { error: 'File not found.' },
        { status: 404 }
      );
    }
    
    // Check access permission
    const hasPermission = 
      user.role === 'ADMIN' || 
      file.userId === user.id || 
      (file.reportId !== null && file.reportId !== undefined);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to download this file.' },
        { status: 403 }
      );
    }
    
    // Check if this is a demo file that was stored in the database
    if (file.isDemo) {
      return handleDemoFileDownload(fileId, file.fileName, file.contentType);
    }
    
    // Real file download logic would go here
    // For now, we'll return a placeholder as we don't have actual files
    return handleFilePlaceholder(file.fileName, file.contentType);
    
  } catch (error) {
    console.error('Error handling file download:', error);
    return NextResponse.json(
      { error: 'Failed to download file. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * Handle demo file downloads by returning placeholder content
 */
function handleDemoFileDownload(
  fileId: string, 
  fileName?: string, 
  contentType?: string
) {
  // Extract file type from fileId if not provided
  if (!fileName || !contentType) {
    const match = fileId.match(/demo-file-(\d+)/);
    const fileNumber = match ? match[1] : '1';
    
    // Default to PDF for odd numbers, JPEG for even numbers
    if (parseInt(fileNumber) % 2 === 0) {
      fileName = `Demo File ${fileNumber}.jpg`;
      contentType = 'image/jpeg';
    } else {
      fileName = `Demo File ${fileNumber}.pdf`;
      contentType = 'application/pdf';
    }
  }
  
  // Generate placeholder content
  const placeholderText = `This is a demo file placeholder for ${fileName}. 
In a production environment, this would be actual file content from storage.`;
  
  // Convert to appropriate format or leave as text
  let responseContent = placeholderText;
  let headers = {
    'Content-Disposition': `attachment; filename="${fileName}"`,
    'Content-Type': contentType || 'text/plain',
  };
  
  return new NextResponse(responseContent, { headers });
}

/**
 * Return a placeholder for real files since we don't have storage implemented
 */
function handleFilePlaceholder(fileName: string, contentType: string) {
  const placeholderText = `This is a placeholder for ${fileName}. 
In a production environment, this would download the actual file from storage.`;
  
  return new NextResponse(placeholderText, { 
    headers: {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': contentType || 'text/plain',
    }
  });
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
      'Access-Control-Max-Age': '86400',
    },
  });
} 