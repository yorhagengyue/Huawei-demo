import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';

/**
 * 验证报告是否已保存到数据库
 * 可以通过reportId直接验证，或者获取用户最近的报告
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.cookies.get('auth_token')?.value 
                || extractTokenFromHeader(request.headers.get('Authorization'));
    
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问', authenticated: false },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: '无效或过期的令牌', authenticated: false },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');
    const minutesAgo = parseInt(searchParams.get('minutesAgo') || '5');
    
    // 如果提供了报告ID，直接验证该报告
    if (reportId) {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          userId: true
        }
      });
      
      if (!report) {
        return NextResponse.json({
          success: false,
          verified: false,
          message: '未找到指定的报告'
        });
      }
      
      // 检查报告是否属于当前用户
      const isOwner = report.userId === user.id;
      
      return NextResponse.json({
        success: true,
        verified: true,
        isOwner,
        report: {
          id: report.id,
          title: report.title,
          createdAt: report.createdAt
        }
      });
    } 
    // 否则，获取用户最近的报告
    else {
      // 计算时间范围
      const now = new Date();
      const timeAgo = new Date(now.getTime() - minutesAgo * 60 * 1000);
      
      // 查询用户最近的报告
      const recentReports = await prisma.report.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: timeAgo
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true
        }
      });
      
      if (recentReports.length === 0) {
        return NextResponse.json({
          success: true,
          verified: false,
          message: `未找到${minutesAgo}分钟内创建的报告`
        });
      }
      
      return NextResponse.json({
        success: true,
        verified: true,
        recentReports
      });
    }
  } catch (error) {
    console.error('验证报告时出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误', success: false },
      { status: 500 }
    );
  }
} 