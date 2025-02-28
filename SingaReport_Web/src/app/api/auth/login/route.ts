import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials } from '@/lib/auth/auth-utils';
import { createToken } from '@/lib/auth/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract login credentials
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码必填' },
        { status: 400 }
      );
    }

    // Validate credentials
    const user = await validateCredentials(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码无效' },
        { status: 401 }
      );
    }

    // 创建JWT令牌
    const token = createToken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // 设置cookie (可选)
    const response = NextResponse.json(
      { 
        success: true,
        message: '登录成功',
        user,
        token
      },
      { status: 200 }
    );

    // 如果需要，设置HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24小时
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 