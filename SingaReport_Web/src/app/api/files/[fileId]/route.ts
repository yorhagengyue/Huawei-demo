import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt-utils';
import { v4 as uuidv4 } from 'uuid';

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
    // 1. 获取文件ID
    const { fileId } = params;
    
    // 2. 身份验证
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
    
    // 3. 检查文件是否存在
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        scanResult: true,
        user: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });
    
    if (!file) {
      // 记录访问失败日志
      await logFileAccess({
        fileId,
        userId: user.id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        isAuthorized: false,
        errorMessage: 'File not found',
      });
      
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // 4. 检查文件扫描状态
    if (file.scanStatus === 'infected') {
      // 记录访问被拒绝日志
      await logFileAccess({
        fileId,
        userId: user.id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        isAuthorized: false,
        errorMessage: 'File is infected with malware',
      });
      
      return NextResponse.json(
        { error: 'File is infected with malware and cannot be accessed' },
        { status: 403 }
      );
    }
    
    // 5. 检查访问权限 (文件所有者或管理员可访问)
    const isOwner = file.userId === user.id;
    const isAdmin = user.role === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      // 对于非所有者，检查报告共享设置
      if (file.reportId) {
        // TODO: 实现报告共享检查逻辑
        // const hasAccess = await checkReportAccess(file.reportId, user.id);
        // if (!hasAccess) {
        //   await logFileAccess({ ... });
        //   return NextResponse.json({ error: 'Not authorized to access this file' }, { status: 403 });
        // }
      } else {
        // 记录未授权访问日志
        await logFileAccess({
          fileId,
          userId: user.id,
          ipAddress: getClientIp(request),
          userAgent: request.headers.get('user-agent') || 'unknown',
          isAuthorized: false,
          errorMessage: 'Not authorized to access this file',
        });
        
        return NextResponse.json(
          { error: 'Not authorized to access this file' },
          { status: 403 }
        );
      }
    }

    // 6. 记录访问日志
    await logFileAccess({
      fileId,
      userId: user.id,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      accessType: 'METADATA', // 仅获取元数据
    });
    
    // 7. 返回文件元数据
    const fileMetadata = {
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      contentType: file.contentType,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      scanStatus: file.scanStatus,
      owner: {
        id: file.user.id,
        username: file.user.username,
      },
      reportId: file.reportId,
      downloadUrl: `/api/files/${fileId}/download`, // 下载URL
      metadata: file.metadata,
      tags: file.tags,
    };
    
    return NextResponse.json(fileMetadata);
    
  } catch (error) {
    console.error('File access error:', error);
    return NextResponse.json(
      { error: 'Server error occurred while accessing file' },
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