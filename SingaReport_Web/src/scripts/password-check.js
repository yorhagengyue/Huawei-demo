// 仅查询用户名和密码的脚本
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('正在查询用户密码数据...');
    
    const users = await prisma.user.findMany({
      select: {
        username: true,
        password: true // 仅查询密码字段
      },
      take: 1 // 只取一条记录，确保输出完整
    });
    
    console.log('查询到的密码数据:');
    console.log(JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('查询用户数据时发生错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 