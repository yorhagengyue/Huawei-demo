import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';

// 获取用户信息
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.cookies.get('auth_token')?.value 
                || extractTokenFromHeader(request.headers.get('Authorization'));
    
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: '无效或过期的令牌' },
        { status: 401 }
      );
    }

    // 查询用户信息
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        // 包含用户创建的报告数量
        _count: {
          select: {
            reports: true
          }
        }
      }
    });

    // 如果用户不存在
    if (!userProfile) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 返回用户信息
    return NextResponse.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('获取用户信息出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 更新用户信息
export async function PATCH(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.cookies.get('auth_token')?.value 
                || extractTokenFromHeader(request.headers.get('Authorization'));
    
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: '无效或过期的令牌' },
        { status: 401 }
      );
    }

    // 解析请求数据
    const body = await request.json();
    const { name, phone } = body;
    
    // 至少提供一个字段
    if (!name && !phone) {
      return NextResponse.json(
        { error: '至少提供一个要更新的字段' },
        { status: 400 }
      );
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone })
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: '用户信息更新成功',
      data: updatedUser
    });
  } catch (error) {
    console.error('更新用户信息出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 