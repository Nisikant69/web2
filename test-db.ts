// test-db.ts
import { prisma } from './lib/prisma'

async function testConnection() {
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to Neon PostgreSQL!')

    // Test query
    const userCount = await prisma.user.count()
    console.log(`📊 Current users in database: ${userCount}`)

    // Disconnect
    await prisma.$disconnect()
    console.log('✅ Test completed successfully!')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

testConnection()