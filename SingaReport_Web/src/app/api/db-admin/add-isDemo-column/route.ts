import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * 数据库管理API - 添加isDemo列到File表
 * 仅限开发环境使用
 */
export async function GET() {
  try {
    // 只允许在开发环境中运行
    if (process.env.APP_ENV !== 'development') {
      return NextResponse.json({
        success: false,
        message: '此API只能在开发环境中使用'
      }, { status: 403 });
    }

    console.log('开始添加isDemo列到File表...');
    
    // 使用Prisma执行原始SQL查询
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT false;
    `);
    
    console.log('isDemo列添加成功');
    
    return NextResponse.json({
      success: true,
      message: 'isDemo列已成功添加到File表'
    });
  } catch (error) {
    console.error('添加isDemo列时出错:', error);
    return NextResponse.json({
      success: false,
      message: '添加isDemo列失败',
      error: error.message
    }, { status: 500 });
  }
} 