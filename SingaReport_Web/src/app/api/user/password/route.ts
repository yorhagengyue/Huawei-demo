import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt-utils';
import { verifyPassword, hashPassword } from '@/lib/auth/auth-utils';

// 修改密码
export async function POST(request: NextRequest) {
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
    const { currentPassword, newPassword } = body;
    
    // 基本验证
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '当前密码和新密码都必须提供' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码必须至少6个字符' },
        { status: 400 }
      );
    }

    // 查询用户
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 验证当前密码
    const isPasswordValid = await verifyPassword(currentPassword, userRecord.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '当前密码不正确' },
        { status: 400 }
      );
    }

    // 对新密码进行哈希处理
    const hashedNewPassword = await hashPassword(newPassword);

    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword
      }
    });

    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('密码修改出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}