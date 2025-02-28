import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '注销成功'
    });

    // 清除auth_token cookie
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('注销出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 