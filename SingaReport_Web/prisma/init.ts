const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Initializing database with default users...');

  // Check if test user exists
  let testUser = await prisma.user.findFirst({
    where: {
      username: 'testuser'
    }
  });

  if (!testUser) {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$EJZRlC5dPxXjbES8YQ/oF.FQDZqYXs7EQoXzy2JoO0gdN3R9D8y7i', // 'password123'
        name: 'Test User',
        role: 'USER',
        emailVerified: true
      }
    });
    console.log('Created test user:', testUser.id);
  } else {
    console.log('Test user already exists:', testUser.id);
  }

  console.log('Initialization complete!');
}

main()
  .catch((e) => {
    console.error('Error during initialization:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 