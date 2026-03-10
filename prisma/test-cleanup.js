import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function runTest() {
  console.log("🚀 Starting Mini-Test...");

  // 1. Create 3 "Fresh" tokens (Defaults to now)
  console.log("Creating 3 fresh tokens...");
  for (let i = 0; i < 3; i++) {
    await prisma.token.create({
      data: { refreshToken: `fresh_token_${i}` },
    });
  }

  // 2. Create 2 "Expired" tokens (Backdated to 5 days ago)
  console.log("Creating 2 expired tokens from 5 days ago...");
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  for (let i = 0; i < 2; i++) {
    await prisma.token.create({
      data: {
        refreshToken: `expired_token_${i}`,
        dateAdded: fiveDaysAgo, // Manually overriding the @default(now)
      },
    });
  }

  const count = await prisma.token.count();
  console.log(`✅ Test data injected. Total tokens in DB: ${count}`);
  console.log("👉 Now run: node prisma/cleanup.js");

  await prisma.$disconnect();
}

runTest();
