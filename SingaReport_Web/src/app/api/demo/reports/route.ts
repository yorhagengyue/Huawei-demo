import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// 设置为true允许演示数据包含中文，设置为false仅使用英文演示数据
const ENABLE_CHINESE_DEMO = false;

// 检查字符串是否包含中文字符
function containsChinese(text: string) {
  return /[\u4e00-\u9fa5]/.test(text);
}

export async function GET(request: NextRequest) {
  try {
    console.log('Demo Reports API called');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    console.log('Serving demo data without auth check');
    
    // 删除所有中文演示报告（只在ENABLE_CHINESE_DEMO为false时执行）
    if (!ENABLE_CHINESE_DEMO) {
      try {
        // 查找所有标题或描述包含中文的演示报告
        const chineseReports = await prisma.report.findMany({
          where: {
            isDemo: true,
            OR: [
              { title: { contains: '测试' } },
              { title: { contains: '问题' } },
              { title: { contains: '报告' } },
              { description: { contains: '这是' } },
              { location: { contains: '新加坡' } },
            ]
          }
        });
        
        if (chineseReports.length > 0) {
          console.log(`Found ${chineseReports.length} Chinese demo reports, deleting...`);
          
          // 删除找到的中文报告
          for (const report of chineseReports) {
            // 先删除关联的媒体
            await prisma.media.deleteMany({
              where: { reportId: report.id }
            });
            
            // 然后删除报告
            await prisma.report.delete({
              where: { id: report.id }
            });
          }
          
          console.log('Chinese demo reports deleted');
        }
      } catch (err) {
        console.error('Error cleaning up Chinese reports:', err);
      }
    }
    
    // Query conditions - only return demo data
    const where: any = { isDemo: true };
    if (category) where.category = category;
    if (status) where.status = status;
    
    // Check if we have demo data
    let totalCount = await prisma.report.count({ where });
    
    // Create sample data if none exists
    if (totalCount === 0) {
      console.log('Creating sample reports for demo');
      await createSampleData();
      totalCount = await prisma.report.count({ where });
    }
    
    // 使用函数检查每个文本字段，过滤掉所有包含中文的内容
    if (!ENABLE_CHINESE_DEMO) {
      // 获取所有报告
      const allReports = await prisma.report.findMany({
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
        }
      });
      
      // 过滤出没有中文的报告
      const nonChineseReports = allReports.filter(report => 
        !containsChinese(report.title) && 
        !containsChinese(report.description || '') &&
        !containsChinese(report.location || '')
      );
      
      // 如果过滤后没有报告，创建一个默认的
      if (nonChineseReports.length === 0) {
        console.log('No non-Chinese reports found, returning default');
        
        return NextResponse.json({
          success: true,
          data: {
            reports: [{
              id: 'default-demo-report',
              title: 'Default Demo Report',
              description: 'This is a default demo report generated when no other reports are available.',
              category: 'ROAD',
              status: 'pending',
              location: 'Singapore Downtown',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isDemo: true,
              media: []
            }],
            pagination: {
              total: 1,
              page: 1,
              limit: 10,
              totalPages: 1
            }
          }
        });
      }
      
      // 分页处理过滤后的报告
      const paginatedReports = nonChineseReports.slice(skip, skip + limit);
      
      console.log(`Returning ${paginatedReports.length} non-Chinese demo reports`);
      
      return NextResponse.json({
        success: true,
        data: {
          reports: paginatedReports,
          pagination: {
            total: nonChineseReports.length,
            page,
            limit,
            totalPages: Math.ceil(nonChineseReports.length / limit)
          }
        }
      });
    }
    
    // 正常返回报告（当启用中文时）
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
    
    console.log(`Returning ${reports.length} demo reports`);
    
    // 确保至少返回一个默认的演示报告
    if (reports.length === 0) {
      console.log('No demo reports found, returning default report');
      
      return NextResponse.json({
        success: true,
        data: {
          reports: [{
            id: 'default-demo-report',
            title: 'Default Demo Report',
            description: 'This is a default demo report generated when no other reports are available.',
            category: 'ROAD',
            status: 'pending',
            location: 'Singapore Downtown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDemo: true,
            media: []
          }],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1
          }
        }
      });
    }
    
    // Return results
    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching demo reports:', error);
    
    // 即使出现错误，也返回一个默认的演示报告
    return NextResponse.json({
      success: true,
      data: {
        reports: [{
          id: 'error-fallback-report',
          title: 'Demo Report (Fallback)',
          description: 'This is a fallback demo report generated when an error occurs.',
          category: 'OTHER',
          status: 'pending',
          location: 'Singapore',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: true,
          media: []
        }],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      }
    });
  }
}

// Helper function to create sample data
async function createSampleData() {
  try {
    // Find or create test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123', // Simple password for demo
          name: 'Test User',
          role: 'USER',
          emailVerified: true,
          isActive: true
        }
      });
      console.log('Created test user:', testUser.id);
    }
    
    // Create sample reports with English content
    const report1 = await prisma.report.create({
      data: {
        title: 'Road Pothole Issue',
        description: 'There is a large pothole on the main road that needs immediate repair.',
        category: 'ROAD',
        status: 'pending',
        location: 'Singapore Central',
        latitude: 1.290270,
        longitude: 103.851959,
        userId: testUser.id,
        isDemo: true,
        media: {
          create: [
            {
              type: 'image',
              url: '/images/pothole.jpg',
              isDemo: true
            }
          ]
        }
      }
    });
    
    // Only create Chinese reports if enabled
    if (ENABLE_CHINESE_DEMO) {
      // Add a Chinese demo report for internationalization testing
      const chineseReport = await prisma.report.create({
        data: {
          title: '测试问题报告',
          description: '这是一个自动生成的测试报告，用于展示系统功能。',
          category: 'ROAD',
          status: 'pending',
          location: '新加坡中央商务区',
          latitude: 1.290270,
          longitude: 103.851959,
          userId: testUser.id,
          isDemo: true,
          media: {
            create: [
              {
                type: 'image',
                url: '/images/pothole.jpg',
                isDemo: true
              }
            ]
          }
        }
      });
      
      // Add more demo reports with different statuses
      const chineseReportInProgress = await prisma.report.create({
        data: {
          title: '交通灯故障报告',
          description: '位于乌节路十字路口的交通信号灯出现故障，已持续一天。',
          category: 'TRAFFIC',
          status: 'in_progress',
          location: '乌节路与索美塞路交叉口',
          latitude: 1.301430,
          longitude: 103.837048,
          userId: testUser.id,
          isDemo: true,
          media: {
            create: [
              {
                type: 'image',
                url: '/images/traffic_light.jpg',
                isDemo: true
              }
            ]
          }
        }
      });
      
      const chineseReportResolved = await prisma.report.create({
        data: {
          title: '公园长椅损坏情况',
          description: '东海岸公园的长椅已被修复，感谢市政部门的快速响应。',
          category: 'PARKS',
          status: 'resolved',
          location: '东海岸公园',
          latitude: 1.300782,
          longitude: 103.911200,
          userId: testUser.id,
          isDemo: true,
          media: {
            create: [
              {
                type: 'image',
                url: '/images/bench.jpg',
                isDemo: true
              }
            ]
          }
        }
      });
    }
    
    // Add more English reports with different statuses
    const report2 = await prisma.report.create({
      data: {
        title: 'Traffic Light Malfunction',
        description: 'Traffic light at the intersection of Orchard Road is not working properly.',
        category: 'TRAFFIC',
        status: 'in_progress',
        location: 'Orchard Road Intersection',
        latitude: 1.301430,
        longitude: 103.837048,
        userId: testUser.id,
        isDemo: true,
        media: {
          create: [
            {
              type: 'image',
              url: '/images/traffic_light.jpg',
              isDemo: true
            }
          ]
        }
      }
    });
    
    const report3 = await prisma.report.create({
      data: {
        title: 'Park Bench Repair Needed',
        description: 'Wooden bench in East Coast Park is damaged and needs replacement.',
        category: 'PARKS',
        status: 'resolved',
        location: 'East Coast Park',
        latitude: 1.300782,
        longitude: 103.911200,
        userId: testUser.id,
        isDemo: true,
        media: {
          create: [
            {
              type: 'image',
              url: '/images/bench.jpg',
              isDemo: true
            }
          ]
        }
      }
    });
    
    console.log('Created sample reports');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
} 