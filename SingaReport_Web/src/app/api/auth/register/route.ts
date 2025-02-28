import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/auth-utils';
import { createToken } from '@/lib/auth/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract user registration data
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      address, 
      postalCode, 
      preferredLanguage, 
      agreeTerms, 
      receiveUpdates 
    } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !password || !address || !postalCode) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    if (!agreeTerms) {
      return NextResponse.json(
        { error: '必须同意服务条款' },
        { status: 400 }
      );
    }

    try {
      // Register the user
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase().substring(0, 2)}${Math.floor(Math.random() * 1000)}`;
      
      const newUser = await createUser({
        username,
        email,
        password,
        name: `${firstName} ${lastName}`,
        phone
      });

      // 创建JWT令牌
      const token = createToken({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      });

      // 创建响应
      const response = NextResponse.json(
        { 
          success: true,
          message: '用户注册成功',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username
          },
          token
        },
        { status: 201 }
      );

      // 设置HTTP-only cookie
      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24小时
        path: '/',
      });

      return response;
    } catch (err: any) {
      // Handle specific errors from the createUser function
      return NextResponse.json(
        { error: err.message || '注册失败' },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 