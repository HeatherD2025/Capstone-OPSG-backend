const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.ACCELERATE_URL },
  },
}).$extends(withAccelerate());