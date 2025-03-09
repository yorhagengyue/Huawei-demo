const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Clean up existing data in the correct order to respect foreign key constraints
  console.log('Cleaning up existing data...')
  try {
    // First delete media (depends on reports)
    await prisma.media.deleteMany({})
    console.log('- Media records deleted')
    
    // Then delete reports (depends on users)
    await prisma.report.deleteMany({})
    console.log('- Report records deleted')
    
    // Last delete users (no dependencies)
    await prisma.user.deleteMany({})
    console.log('- User records deleted')
  } catch (err) {
    console.error('Error during cleanup:', err)
    console.log('Continuing with seeding...')
  }

  // Create test user
  console.log('Creating test user...')
  const user = await prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      password: '$2a$10$EJZRlC5dPxXjbES8YQ/oF.FQDZqYXs7EQoXzy2JoO0gdN3R9D8y7i', // 'password123'
      name: 'Test User',
      role: 'USER',
      phone: '+6591234567',
      preferredLanguage: 'english',
      emailVerified: true
    }
  })

  console.log(`Created user: ${user.username} (${user.id})`)

  // Create anonymous user for reports without authentication
  console.log('Creating anonymous user...')
  const anonymousUser = await prisma.user.create({
    data: {
      username: 'anonymous',
      email: 'anonymous@example.com',
      password: 'not_a_real_password', // This is just a placeholder
      name: 'Anonymous User',
      role: 'USER',
      emailVerified: true
    }
  })

  console.log(`Created anonymous user: ${anonymousUser.username} (${anonymousUser.id})`)

  // Create test reports
  console.log('Creating sample reports...')
  
  const reportData = [
    {
      title: 'Pothole on Orchard Road',
      description: 'Large pothole causing traffic congestion',
      category: 'road_damage',
      status: 'open',
      location: 'Orchard Road, Singapore',
      latitude: 1.3045,
      longitude: 103.8322,
      severity: 'high',
      userId: user.id,
      media: [
        { type: 'image', url: 'https://example.com/pothole.jpg' }
      ]
    },
    {
      title: 'Fallen Tree at East Coast Park',
      description: 'Tree has fallen across the pedestrian walkway',
      category: 'fallen_tree',
      status: 'in-progress',
      location: 'East Coast Park, Singapore',
      latitude: 1.3010,
      longitude: 103.9170,
      severity: 'medium',
      userId: user.id,
      media: [
        { type: 'image', url: 'https://example.com/tree.jpg' }
      ]
    },
    {
      title: 'Street Light Outage',
      description: 'Several street lights not working on Clementi Road',
      category: 'lighting_issue',
      status: 'resolved',
      location: 'Clementi Road, Singapore',
      latitude: 1.3162,
      longitude: 103.7649,
      severity: 'low',
      userId: user.id,
      media: []
    }
  ]

  for (const data of reportData) {
    const { media, ...reportInfo } = data
    const report = await prisma.report.create({
      data: {
        ...reportInfo,
        media: {
          create: media
        }
      }
    })
    console.log(`Created report: ${report.title} (${report.id})`)
  }

  console.log('Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 