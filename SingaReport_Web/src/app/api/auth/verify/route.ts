import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt-utils';

export async function GET(request: NextRequest) {
  try {
    // 从Cookie中获取认证令牌
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { 
          authenticated: false, 
          message: '未找到认证令牌' 
        }, 
        { status: 401 }
      );
    }

    // 验证令牌
    const decodedToken = verifyToken(authToken);

    if (!decodedToken) {
      return NextResponse.json(
        { 
          authenticated: false, 
          message: '令牌无效或已过期' 
        }, 
        { status: 401 }
      );
    }

    // 返回用户信息（不包含敏感数据）
    return NextResponse.json(
      { 
        authenticated: true, 
        user: {
          id: decodedToken.id,
          email: decodedToken.email,
          username: decodedToken.username
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('令牌验证错误:', error);
    return NextResponse.json(
      { 
        authenticated: false, 
        message: '身份验证过程中发生错误' 
      }, 
      { status: 500 }
    );
  }
} 