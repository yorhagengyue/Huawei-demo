import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt-utils';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

/**
 * 记录文件管理活动
 */
async function logFileActivity({
  fileId,
  userId,
  ipAddress,
  userAgent,
  action = 'DELETE',
  isAuthorized = true,
  errorMessage = null,
  metadata = {},
}: {
  fileId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  isAuthorized?: boolean;
  errorMessage?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    // 使用FileAccessLog表记录删除操作
    const activityLog = await prisma.fileAccessLog.create({
      data: {
        fileId,
        userId,
        ipAddress,
        userAgent,
        accessType: 'DELETE', // 设置为删除操作
        isAuthorized,
        errorMessage,
        requestId: `req-${uuidv4().substring(0, 8)}`,
        metadata // 存储额外元数据
      }
    });
    
    console.log(`File activity logged. ID: ${activityLog.id}, Action: ${action}`);
    return activityLog;
  } catch (error) {
    console.error('Failed to log file activity:', error);
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
 * 检查用户是否有权限删除文件
 */
async function checkDeletePermission(fileId: string, userId: string, userRole: string) {
  // 获取文件信息
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });
  
  if (!file) {
    return { allowed: false, reason: 'File not found', file: null };
  }
  
  // 只有文件所有者或管理员可以删除文件
  const isOwner = file.userId === userId;
  const isAdmin = userRole === 'ADMIN';
  
  if (isOwner || isAdmin) {
    return { allowed: true, reason: null, file };
  }
  
  return { allowed: false, reason: 'Not authorized to delete this file', file };
}

/**
 * 处理文件删除请求
 */
export async function DELETE(
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
        { error: 'Authentication required to delete files.' },
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
    
    // 3. 检查删除权限
    const { allowed, reason, file } = await checkDeletePermission(
      fileId,
      user.id,
      user.role
    );
    
    if (!allowed || !file) {
      // 记录未授权删除尝试
      await logFileActivity({
        fileId,
        userId: user.id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'DELETE_ATTEMPT',
        isAuthorized: false,
        errorMessage: reason,
      });
      
      return NextResponse.json(
        { error: reason },
        { status: file ? 403 : 404 }
      );
    }
    
    // 4. 记录删除前的文件信息（用于审计）
    const fileMeta = {
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      userId: file.userId,
      createdAt: file.createdAt,
      reportId: file.reportId,
      deletedAt: new Date(),
      deletedBy: user.id,
      isAdminDelete: user.role === 'ADMIN' && user.id !== file.userId
    };
    
    try {
      // 5. 软删除：更新文件状态为"已删除"
      await prisma.file.update({
        where: { id: fileId },
        data: { 
          status: 'DELETED',
          deletedAt: new Date(),
          deletedBy: user.id
        }
      });
      
      // 6. 如果文件实际存在于磁盘上，可以考虑物理删除或移动到回收站
      // 临时使用本地存储，未来会替换为华为云OBS存储
      const uploadDir = path.resolve(process.cwd(), 'uploads', file.userId);
      const filePath = path.join(uploadDir, fileId);
      
      try {
        // 检查文件是否存在于磁盘
        // await fs.access(filePath);
        // 将文件移动到回收站或删除
        // await fs.rename(filePath, path.join(process.cwd(), 'recyclebin', fileId));
        // 也可直接删除
        // await fs.unlink(filePath);
      } catch (fsError) {
        // 文件可能不在磁盘上，忽略错误
        console.log('File not found on disk or already removed:', fsError);
      }
      
      // 7. 记录删除活动
      await logFileActivity({
        fileId,
        userId: user.id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'DELETE_SUCCESS',
        metadata: fileMeta
      });
      
      // 8. 返回成功响应
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully',
        fileId: fileId
      });
      
    } catch (deleteError) {
      console.error('File deletion error:', deleteError);
      
      // 记录删除失败
      await logFileActivity({
        fileId,
        userId: user.id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'DELETE_FAILED',
        errorMessage: deleteError instanceof Error ? deleteError.message : 'Unknown deletion error',
      });
      
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('File deletion request error:', error);
    
    return NextResponse.json(
      { error: 'Server error occurred while processing deletion request' },
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Max-Age': '86400',
    },
  });
} 