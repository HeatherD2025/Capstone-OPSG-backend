import test from "node:test";
import prisma from "./common/client.js";

async function testAccelerate() {
    try {
        console.log("Testing database connection with Prisma Accelerate...");

        const start = Date.now();
        const companies = await prisma.company.findMany({
            include: {
                employees: true,
            },
        });
        console.log(`Retrieved ${companies.length} companies with employees.`);
        companies.forEach((company) => {
            console.log(`- ${company.name} has ${company.employees.length} employees.`);
        });
    } catch (error) {
        
    } finally {
        await prisma.$disconnect();
    }
}

testAccelerate();