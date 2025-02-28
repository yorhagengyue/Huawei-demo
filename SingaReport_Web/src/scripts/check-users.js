// 查询用户表数据脚本
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('正在查询用户数据...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        password: true // 注意：这里包含了密码字段，但实际应用中应避免显示密码
      }
    });
    
    console.log('查询到的用户数据:');
    console.log(JSON.stringify(users, null, 2));
    console.log(`总共查询到 ${users.length} 条用户记录`);
    
  } catch (error) {
    console.error('查询用户数据时发生错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 