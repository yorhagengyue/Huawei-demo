import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';

// 获取报告列表
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    // 获取报告总数
    const total = await prisma.report.count({ where });

    // 查询报告列表
    const reports = await prisma.report.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          }
        },
        media: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取报告列表出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 创建新报告
export async function POST(request: NextRequest) {
  try {
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

    // 解析请求数据
    const body = await request.json();
    const { title, description, category, location, latitude, longitude, mediaUrls } = body;

    // 基本验证
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: '标题、描述和类别为必填项' },
        { status: 400 }
      );
    }

    // 创建报告
    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        userId: user.id,
        // 如果有媒体文件，创建关联
        ...(mediaUrls && mediaUrls.length > 0 && {
          media: {
            create: mediaUrls.map((url: string) => ({
              type: url.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
              url
            }))
          }
        })
      },
      include: {
        media: true
      }
    });

    return NextResponse.json(
      { 
        success: true,
        message: '报告创建成功',
        data: report
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建报告出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 