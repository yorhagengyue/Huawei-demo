import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';

// 获取单个报告详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    // 查询报告详情
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        media: true
      }
    });

    // 如果报告不存在
    if (!report) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      );
    }

    // 返回报告详情
    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('获取报告详情出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 更新报告
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    // 验证用户身份
    const token = request.cookies.get('auth_token')?.value 
                || extractTokenFromHeader(request.headers.get('Authorization'));
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: '无效或过期的令牌' },
        { status: 401 }
      );
    }

    // 检查报告是否存在
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
      select: { userId: true }
    });

    // 如果报告不存在
    if (!existingReport) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      );
    }

    // 检查权限（只有报告的创建者或管理员才能更新）
    // TODO: 添加管理员权限检查
    if (existingReport.userId !== user.id) {
      return NextResponse.json(
        { error: '没有权限修改此报告' },
        { status: 403 }
      );
    }

    // 解析请求数据
    const body = await request.json();
    const { title, description, category, location, latitude, longitude, status } = body;

    // 更新报告
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(location && { location }),
        ...(latitude && { latitude: parseFloat(latitude) }),
        ...(longitude && { longitude: parseFloat(longitude) }),
        ...(status && { status })
      },
      include: {
        media: true
      }
    });

    return NextResponse.json({
      success: true,
      message: '报告更新成功',
      data: updatedReport
    });
  } catch (error) {
    console.error('更新报告出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 删除报告
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    // 验证用户身份
    const token = request.cookies.get('auth_token')?.value 
                || extractTokenFromHeader(request.headers.get('Authorization'));
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: '无效或过期的令牌' },
        { status: 401 }
      );
    }

    // 检查报告是否存在
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
      select: { userId: true }
    });

    // 如果报告不存在
    if (!existingReport) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      );
    }

    // 检查权限（只有报告的创建者或管理员才能删除）
    // TODO: 添加管理员权限检查
    if (existingReport.userId !== user.id) {
      return NextResponse.json(
        { error: '没有权限删除此报告' },
        { status: 403 }
      );
    }

    // 删除报告（媒体文件会通过级联删除自动删除）
    await prisma.report.delete({
      where: { id: reportId }
    });

    return NextResponse.json({
      success: true,
      message: '报告删除成功'
    });
  } catch (error) {
    console.error('删除报告出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 