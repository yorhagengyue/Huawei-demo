import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt-utils';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

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
  const startTime = Date.now();
  
  try {
    // 1. 获取文件ID
    const { fileId } = params;
    
    // 2. 身份验证
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
    
    // 3. 检查下载权限
    const { allowed, reason, file } = await checkDownloadPermission(
      fileId,
      user.id,
      user.role
    );
    
    if (!allowed || !file) {
      // 记录未授权下载尝试
      await logFileAccess({
        fileId,
        userId: user.id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        isAuthorized: false,
        errorMessage: reason,
      });
      
      return NextResponse.json(
        { error: reason },
        { status: file ? 403 : 404 }
      );
    }
    
    // 4. 记录文件下载日志
    await logFileAccess({
      fileId,
      userId: user.id,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
    });
    
    // 5. 获取文件路径（这里应根据实际存储位置调整）
    // 临时使用本地存储，未来会替换为华为云OBS存储
    const uploadDir = path.resolve(process.cwd(), 'uploads', user.id);
    const filePath = path.join(uploadDir, fileId);
    
    try {
      // 目前我们只是模拟文件下载，因为文件实际上还未存储到磁盘
      // 未来这里将连接到华为云OBS获取文件
      
      // 检查文件是否存在
      //await fs.access(filePath);
      
      // 6. 返回文件数据
      // const fileData = await fs.readFile(filePath);
      
      // 模拟文件数据（仅用于开发测试）
      const fileData = Buffer.from('This is a simulated file content for ' + file.fileName);
      
      // 7. 构建响应
      const response = new NextResponse(fileData);
      
      // 设置适当的头信息
      response.headers.set('Content-Type', file.contentType || 'application/octet-stream');
      response.headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`);
      response.headers.set('Content-Length', fileData.length.toString());
      
      // 如果需要跟踪下载次数，可以更新数据库
      await prisma.file.update({
        where: { id: fileId },
        data: { 
          downloadCount: { increment: 1 },
          lastDownloadedAt: new Date()
        }
      });
      
      return response;
      
    } catch (fileError) {
      console.error('File retrieval error:', fileError);
      
      // 记录文件读取失败
      await logFileAccess({
        fileId,
        userId: user.id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        isAuthorized: true,
        errorMessage: 'File retrieval failed',
      });
      
      return NextResponse.json(
        { error: 'Could not retrieve the requested file' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('File download error:', error);
    
    return NextResponse.json(
      { error: 'Server error occurred while processing download' },
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