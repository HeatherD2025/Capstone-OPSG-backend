import { PrismaClient } from '@prisma/client/edge.js';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ACCELERATE_URL,
    },
  },
}).$extends(withAccelerate());

export default prisma;