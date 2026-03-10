// find tokens older than 3 days and delete them

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanupTokens() {
    try {
        console.log("Staring token cleanup...");

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const deleted = await prisma.token.deleteMany({
            where: {
                createdAt: {
                    lt: threeDaysAgo,
                },
            },
        });

        console.log(`Deleted ${deleted.count} old tokens.`);
    } catch (error) {
        console.error("Error occurred while cleaning up tokens:", error);  
    } finally {
        await prisma.$disconnect();
    }
}

cleanupTokens()