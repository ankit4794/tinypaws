import { PrismaClient } from '@prisma/client';

// Add the DATABASE_URL from the environment to the prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export default prisma;