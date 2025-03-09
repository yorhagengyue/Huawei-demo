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
  accessType = 'VIEW',
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
    
    console.log(`File access logged. ID: ${accessLog.id}, Type: ${accessLog.accessType}`);
    return accessLog;
  } catch (error) {
    console.error('Failed to log file access:', error);
    // 不阻止主要功能
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
 * 获取文件元数据信息
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
    
    // For demo files, return placeholder metadata
    if (isDemoFile) {
      return handleDemoFileView(fileId);
    }
    
    // Authenticate user
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required to view files.' },
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
            id: true,
            username: true,
            email: true
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
        { error: 'You do not have permission to view this file.' },
        { status: 403 }
      );
    }
    
    // Check if this is a demo file that was stored in the database
    if (file.isDemo) {
      return handleDemoFileView(fileId, file);
    }
    
    // Get download URL
    const downloadUrl = `/api/files/${file.id}/download`;
    
    // Return file metadata
    const fileInfo = {
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      contentType: file.contentType,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      downloadCount: file.downloadCount,
      scanStatus: file.scanStatus,
      tags: file.tags,
      user: {
        id: file.user.id,
        username: file.user.username,
      },
      downloadUrl,
      previewAvailable: isPreviewAvailable(file.fileType),
      isDemo: file.isDemo || false,
    };
    
    return NextResponse.json(fileInfo);
  } catch (error) {
    console.error('Error handling file view:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file information. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * Handle demo file view by returning placeholder metadata
 */
function handleDemoFileView(fileId: string, existingFile?: any) {
  // If we have existing file data, use it
  if (existingFile) {
    const downloadUrl = `/api/files/${existingFile.id}/download`;
    return NextResponse.json({
      ...existingFile,
      downloadUrl,
      previewAvailable: isPreviewAvailable(existingFile.fileType),
      isDemo: true,
    });
  }
  
  // Generate placeholder metadata for demo file
  const match = fileId.match(/demo-file-(\d+)/);
  const fileNumber = match ? match[1] : '1';
  
  // Default to PDF for odd numbers, JPEG for even numbers
  let fileName, fileType, contentType, fileSize;
  if (parseInt(fileNumber) % 2 === 0) {
    fileName = `Demo File ${fileNumber}.jpg`;
    fileType = 'image/jpeg';
    contentType = 'image/jpeg';
    fileSize = 1024 * 1024 * (parseInt(fileNumber) % 5 + 1); // 1-5 MB
  } else {
    fileName = `Demo File ${fileNumber}.pdf`;
    fileType = 'application/pdf';
    contentType = 'application/pdf';
    fileSize = 1024 * 1024 * (parseInt(fileNumber) % 10 + 1); // 1-10 MB
  }
  
  // Current date adjusted by file number
  const now = new Date();
  const createdAt = new Date(now);
  createdAt.setDate(now.getDate() - parseInt(fileNumber) % 30);
  
  const fileInfo = {
    id: fileId,
    fileName,
    fileSize,
    fileType,
    contentType,
    createdAt: createdAt.toISOString(),
    updatedAt: now.toISOString(),
    downloadCount: parseInt(fileNumber) % 20,
    scanStatus: 'clean',
    tags: ['demo', 'sample'],
    user: {
      id: 'demo-user',
      username: 'demouser',
    },
    downloadUrl: `/api/files/${fileId}/download`,
    previewAvailable: isPreviewAvailable(fileType),
    isDemo: true,
  };
  
  return NextResponse.json(fileInfo);
}

/**
 * Determine if file type can be previewed in browser
 */
function isPreviewAvailable(fileType: string): boolean {
  const previewableTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
  ];
  
  return previewableTypes.includes(fileType);
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