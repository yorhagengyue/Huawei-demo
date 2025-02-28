import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // 查询所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        password: true // 为了验证密码已经哈希存储
      }
    });
    
    console.log('数据库中的用户:');
    console.log(JSON.stringify(users, null, 2));
    console.log(`共找到 ${users.length} 个用户`);
  } catch (error) {
    console.error('查询出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 