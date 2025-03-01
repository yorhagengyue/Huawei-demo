import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt-utils';
import { getUploadMessages, formatMessage, SupportedLanguage } from '@/lib/i18n/messages';
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
 * 获取客户端首选语言
 */
function getClientLanguage(request: NextRequest): SupportedLanguage {
  // 从Accept-Language头获取首选语言
  const acceptLanguage = request.headers.get('accept-language') || '';
  
  // 检查支持的语言
  if (acceptLanguage.includes('zh')) return 'zh';
  if (acceptLanguage.includes('ms')) return 'ms';
  if (acceptLanguage.includes('ta')) return 'ta';
  
  // 默认英语
  return 'en';
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
        tags: []
      }
    });
    
    return file;
  } catch (error) {
    console.error('Failed to create file record:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req-${uuidv4().substring(0, 8)}`;
  
  try {
    // 1. 身份验证
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required to upload files.' },
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

    // 2. 确定客户端语言
    const clientLang = getClientLanguage(request);
    const messages = getUploadMessages(clientLang);
    
    // 3. 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const reportId = formData.get('reportId') as string | null;
    const dataConsent = formData.get('dataConsent') === 'true'; // PDPA同意
    
    // 4. 基本验证
    if (!file) {
      await logUploadActivity({
        userId: user.id,
        originalName: 'unknown',
        fileSize: 0,
        fileType: 'unknown',
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'FAILED',
        errorMessage: messages.errors.noFileSelected,
        requestId,
        processingTime: Math.floor(Date.now() - startTime)
      });
      
      return NextResponse.json(
        { error: messages.errors.noFileSelected },
        { status: 400 }
      );
    }
    
    // 5. 文件大小验证
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = formatMessage(messages.errors.fileTooLarge, { 
        maxSize: MAX_FILE_SIZE / (1024 * 1024) 
      });
      
      // 记录失败日志
      await logUploadActivity({
        userId: user.id,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'REJECTED_SIZE',
        errorMessage: errorMsg,
        requestId,
        processingTime: Math.floor(Date.now() - startTime),
        dataConsent
      });
      
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }
    
    // 6. 文件类型验证
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const errorMsg = formatMessage(messages.errors.invalidFileType, { 
        allowedTypes: ALLOWED_FILE_TYPES.join(', ') 
      });
      
      // 记录失败日志
      await logUploadActivity({
        userId: user.id,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'REJECTED_TYPE',
        errorMessage: errorMsg,
        requestId,
        processingTime: Math.floor(Date.now() - startTime),
        dataConsent
      });
      
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }
    
    // 7. 生成唯一文件ID
    const fileId = uuidv4();
    
    // 8. 获取文件元数据
    const metadata = {
      reportId: reportId,
      description: formData.get('description'),
      tags: formData.get('tags'),
      categoryId: formData.get('categoryId'),
      location: formData.get('location')
    };
    
    // 9. 读取文件内容
    const fileBuffer = await file.arrayBuffer();
    
    // TODO: 这里将来会进行华为云OBS上传实现
    // 目前仅模拟上传成功
    
    // 10. 创建文件记录
    const fileRecord = await createFileRecord({
      fileId,
      userId: user.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      reportId: reportId || undefined,
      metadata
    });
    
    // 11. 记录上传日志
    const uploadLog = await logUploadActivity({
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
      dataConsent,
      metadata
    });
    
    // 12. 返回成功响应
    return NextResponse.json({
      success: true,
      message: messages.status.success,
      fileId: fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      // 未来这里会返回实际的文件URL
      fileUrl: `/api/files/${fileId}`
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    
    // 根据客户端语言提供错误消息
    const lang = getClientLanguage(request);
    const errorMsg = getUploadMessages(lang).errors.serverError;
    
    // 尝试记录错误日志
    try {
      await logUploadActivity({
        userId: 'unknown', // 错误处理中可能无法获取用户ID
        originalName: 'unknown',
        fileSize: 0,
        fileType: 'unknown',
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : String(error),
        requestId,
        processingTime: Math.floor(Date.now() - startTime)
      });
    } catch (logError) {
      console.error('Failed to log upload error:', logError);
    }
    
    return NextResponse.json(
      { error: errorMsg },
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 