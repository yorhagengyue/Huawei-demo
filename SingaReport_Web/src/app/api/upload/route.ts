import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt-utils';
import { prisma } from '@/lib/db/prisma';
import { v4 as uuidv4 } from 'uuid';

// 文件大小限制: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; 

// 允许的文件类型
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic', // 常见于新加坡iOS用户
  'application/pdf',
  'video/mp4',
  'video/quicktime', // iOS视频格式
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

// 简化的错误信息
const ERROR_MESSAGES = {
  noFileSelected: 'No file selected. Please select a file to upload.',
  fileTooLarge: `File size exceeds maximum limit (${MAX_FILE_SIZE / (1024 * 1024)}MB).`,
  invalidFileType: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
  unauthorized: 'Authentication required to upload files.',
  sessionExpired: 'Your session has expired. Please log in again.',
  serverError: 'An error occurred during upload. Please try again.'
};

// 文件上传记录接口
interface UploadLogData {
  fileId?: string;
  userId: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  ipAddress: string;
  userAgent: string;
  status: string;
  errorMessage?: string;
  containsPII?: boolean;
  dataConsent?: boolean;
  requestId?: string;
  processingTime?: number;
  sourceSystem?: string;
  destinationSystem?: string;
  metadata?: any;
}

/**
 * 记录上传审计日志到数据库
 */
async function logUploadActivity(logData: UploadLogData) {
  try {
    const startTime = Date.now();
    
    // 创建审计日志记录
    const uploadLog = await prisma.uploadLog.create({
      data: {
        fileId: logData.fileId,
        originalName: logData.originalName,
        fileSize: logData.fileSize,
        fileType: logData.fileType,
        userId: logData.userId,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
        status: logData.status,
        errorMessage: logData.errorMessage,
        containsPII: logData.containsPII || false,
        dataConsent: logData.dataConsent || false,
        requestId: logData.requestId || `req-${uuidv4().substring(0, 8)}`,
        processingTime: logData.processingTime || Math.floor(Date.now() - startTime),
        sourceSystem: logData.sourceSystem || 'web-upload',
        destinationSystem: logData.destinationSystem || 'local-storage', // 未来会是'huawei-obs'
        metadata: logData.metadata || {}
      }
    });
    
    // 打印审计记录(用于开发调试)
    console.log(`Audit log created. ID: ${uploadLog.id}, Status: ${uploadLog.status}`);
    
    return uploadLog;
  } catch (error) {
    console.error('Failed to create upload audit log:', error);
    // 即使日志创建失败，也不应阻止主要功能
    return null;
  }
}

/**
 * 获取客户端IP地址
 */
function getClientIp(request: NextRequest): string {
  // 尝试从Cloudflare或代理头获取真实IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // 这可能是一个内网IP
  return request.ip || '127.0.0.1';
}

/**
 * 创建文件记录
 */
async function createFileRecord(fileData: {
  fileId: string,
  userId: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  reportId?: string,
  isDemo?: boolean,
  metadata?: any
}) {
  try {
    const file = await prisma.file.create({
      data: {
        id: fileData.fileId,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileType: fileData.fileType,
        contentType: fileData.fileType,
        storageType: 'local', // 未来会是'huawei_obs'
        storagePath: `/uploads/${fileData.userId}/${fileData.fileId}`, // 临时路径
        userId: fileData.userId,
        reportId: fileData.reportId,
        metadata: fileData.metadata || {},
        scanStatus: 'pending',
        tags: [],
        isDemo: fileData.isDemo || false
      }
    });
    
    return file;
  } catch (error) {
    console.error('Failed to create file record:', error);
    return null;
  }
}

/**
 * 为演示模式创建模拟上传
 */
function createDemoUpload(
  userId: string,
  file: File,
  reportId: string | null,
  requestId: string
) {
  // 使用与文件列表API匹配的ID格式：demo-file-xxx
  // 生成1-100之间的随机数作为文件ID
  const randomId = Math.floor(Math.random() * 100) + 1;
  const fileId = `demo-file-${randomId}`;
  
  // 使用当前正确的时间
  const now = new Date();
  const isoDate = now.toISOString();
  const formattedDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // 为文件创建更合适的标签
  let tags = ['upload'];
  
  // 根据文件类型添加标签
  if (file.type.includes('image')) {
    tags.push('image');
  } else if (file.type.includes('pdf')) {
    tags.push('document');
  } else if (file.type.includes('video')) {
    tags.push('video');
  }
  
  return {
    id: fileId,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    contentType: file.type,
    url: `/api/files/${fileId}/download`,
    viewUrl: `/api/files/${fileId}`,
    reportId: reportId,
    createdAt: isoDate,
    updatedAt: isoDate,
    formattedDate: `${formattedDate} ${formattedTime}`,
    scanStatus: 'clean',
    isDemo: true,
    tags: tags,
    requestId: requestId,
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req-${uuidv4().substring(0, 8)}`;
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  
  try {
    // 1. 身份验证
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      if (isDemoMode) {
        // 演示模式下无需认证
        console.log("Demo mode: proceeding without authentication");
      } else {
        return NextResponse.json(
          { error: ERROR_MESSAGES.unauthorized },
          { status: 401 }
        );
      }
    }

    let user = { id: 'demo-user', role: 'USER' };
    if (token) {
      const verifiedUser = await verifyToken(token);
      if (!verifiedUser) {
        if (!isDemoMode) {
          return NextResponse.json(
            { error: ERROR_MESSAGES.sessionExpired },
            { status: 401 }
          );
        }
      } else {
        user = verifiedUser;
      }
    }

    // 3. 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const reportId = formData.get('reportId') as string | null;
    const dataConsent = formData.get('dataConsent') === 'true'; // PDPA同意
    const isDemo = formData.get('isDemo') === 'true'; // 是否为演示数据 - 仅当用户明确选择时才为true
    
    // 4. 基本验证
    if (!file) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.noFileSelected },
        { status: 400 }
      );
    }
    
    // 5. 文件大小验证
    if (file.size > MAX_FILE_SIZE) {
      // 记录失败日志
      await logUploadActivity({
        userId: user.id,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'REJECTED_SIZE',
        errorMessage: ERROR_MESSAGES.fileTooLarge,
        requestId,
        processingTime: Math.floor(Date.now() - startTime),
        dataConsent
      });
      
      return NextResponse.json(
        { error: ERROR_MESSAGES.fileTooLarge },
        { status: 400 }
      );
    }
    
    // 6. 文件类型验证
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      // 记录失败日志
      await logUploadActivity({
        userId: user.id,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'REJECTED_TYPE',
        errorMessage: ERROR_MESSAGES.invalidFileType,
        requestId,
        processingTime: Math.floor(Date.now() - startTime),
        dataConsent
      });
      
      return NextResponse.json(
        { error: ERROR_MESSAGES.invalidFileType },
        { status: 400 }
      );
    }
    
    // 7. 文件上传处理
    try {
      // 确定是否使用演示模式
      // 只有当用户明确勾选"Mark as demo data"或无法连接数据库时才使用演示模式
      const useDemoMode = isDemo || (isDemoMode && !prisma);
      
      // 如果是演示模式，创建模拟上传
      if (useDemoMode) {
        const demoUpload = createDemoUpload(user.id, file, reportId, requestId);
        
        // 在响应头中添加特殊指令，告诉客户端保存此文件到sessionStorage
        const responseHeaders = new Headers();
        responseHeaders.append('X-Demo-File-Storage', 'true');
        
        // 获取用户显示名称 - 由于user对象类型限制，使用更安全的方式
        const username = typeof user === 'object' && 
                        'username' in user ? user.username : 
                        ('email' in user ? (user.email as string).split('@')[0] : 'user');
        
        return NextResponse.json({
          success: true,
          fileId: demoUpload.id,
          fileName: demoUpload.fileName,
          fileUrl: demoUpload.url,
          viewUrl: demoUpload.viewUrl,
          isDemo: true,
          message: 'Demo file uploaded successfully',
          // 添加更多文件信息，供客户端存储
          fileDetails: {
            id: demoUpload.id,
            fileName: demoUpload.fileName,
            fileSize: demoUpload.fileSize,
            fileType: demoUpload.fileType,
            contentType: demoUpload.contentType,
            createdAt: demoUpload.createdAt,
            updatedAt: demoUpload.updatedAt,
            formattedDate: demoUpload.formattedDate,
            scanStatus: 'clean',
            downloadCount: 0,
            status: 'active',
            tags: demoUpload.tags,
            reportId: reportId,
            downloadUrl: demoUpload.url,
            viewUrl: demoUpload.viewUrl,
            isDemo: true,
            user: {
              id: user.id,
              username: username,
              email: 'email' in user ? user.email as string : 'demo@example.com'
            }
          }
        }, { headers: responseHeaders });
      }
      
      // 生成唯一文件ID
      const fileId = uuidv4();
      
      // 为上传的文件创建记录
      const fileRecord = await createFileRecord({
        fileId,
        userId: user.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        reportId: reportId || undefined,
        isDemo,
        metadata: {
          originalName: file.name,
          requestId,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.id,
          clientIp: getClientIp(request),
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
      
      // 记录上传日志
      await logUploadActivity({
        fileId,
        userId: user.id,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'SUCCESS',
        requestId,
        processingTime: Math.floor(Date.now() - startTime),
        dataConsent
      });
      
      // 返回成功响应
      return NextResponse.json({
        success: true,
        fileId,
        fileName: file.name,
        fileUrl: `/api/files/${fileId}/download`,
        viewUrl: `/api/files/${fileId}`,
        message: 'File uploaded successfully'
      });
      
    } catch (uploadError) {
      console.error('File upload processing error:', uploadError);
      
      // 记录上传失败日志
      await logUploadActivity({
        userId: user.id,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'FAILED',
        errorMessage: uploadError instanceof Error ? uploadError.message : 'Unknown error',
        requestId,
        processingTime: Math.floor(Date.now() - startTime),
        dataConsent
      });
      
      return NextResponse.json(
        { error: ERROR_MESSAGES.serverError },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 