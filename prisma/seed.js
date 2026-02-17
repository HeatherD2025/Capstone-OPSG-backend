import prisma from "../common/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { faker } from "@faker-js/faker";

const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD;
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD;


// Seed db with fake companies, users, and users with company relationships
async function seed() {
  try {
    console.log("Clearing existing data...");
    await prisma.token.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();

    console.log("Creating fake companies");
    // Create companies
    const companies = [];

    for (let i = 0; i < 5; i++) {
      const company = await prisma.company.create({
        data: {
          name: faker.company.name(),
          phoneNumber: faker.phone.number(),
          streetAddress: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zip: parseInt(faker.location.zipCode("#####")),
          dateAdded: faker.date.past(1),
          dateUpdated: faker.date.recent(),
        },
      });
      companies.push(company);
    }

    console.log(`Created ${companies.length}`);
    companies.forEach((c) => console.log(`- ${c.name}`));

    const seededTokens = [];

    console.log("Creating users for companies");
    // users for companies
    for (const company of companies) {
      const numEmployees = faker.number.int({ min: 1, max: 10 });
      for (let i = 0; i < numEmployees; i++) {
        const password = faker.internet.password();
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
          data: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: hashedPassword,
            dateAdded: faker.date.past(1),
            dateUpdated: faker.date.recent(),
            companyId: company.id,
          },
        });

        const accessToken = jwt.sign(
          { id: user.id, email: user.email },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
          { id: user.id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "6h" }
        );

        seededTokens.push({
          email: user.email,
          accessToken,
          refreshToken,
        });
      }
    }

    // creating users without a company
    for (let i = 0; i < 5; i++) {
      const password = faker.internet.password();
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          password: hashedPassword,
          dateAdded: faker.date.past(1),
          dateUpdated: faker.date.recent(),
        },
      });

      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "3d" }
      );

      seededTokens.push({
        email: user.email,
        accessToken,
        refreshToken,
      });
    }

    //create admin role for myself
    const hashedAdminPassword = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
    const admin = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "Demo",
        email: "adminDemo@demo.com",
        password: hashedAdminPassword,
        isAdmin: true,
      },
    });

    const adminAccessToken = jwt.sign(
      { id: admin.id, email: admin.email, isAdmin: true },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const adminRefreshToken = jwt.sign(
      { id: admin.id, email: admin.email, isAdmin: true },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "3d" }
    );

    seededTokens.push({
      email: admin.email,
      adminAccessToken,
      adminRefreshToken,
    });

    // Creating a demo user role
    const hashedDemoUserPassword = await bcrypt.hash(DEMO_USER_PASSWORD, 10);
    const user = await prisma.user.create({
      data: {
        firstName: "Demo",
        lastName: "User",
        email: "demo@demo.com",
        password: hashedDemoUserPassword,
        isAdmin: false,
        company: {
          create: {
            name: "Corktown Medical Center",
            phoneNumber: "555-675-4399",
            streetAddress: "9934 Michigan Ave",
            city: "Detroit",
            state: "MI",
            zip: 48216,
            dateAdded: new Date("2025-07-18T08:13:22Z"),
            dateUpdated: new Date("2025-10-13T00:00:00Z"),
          },
        },
      },
    });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "3d" }
    );

    seededTokens.push({
      email: user.email,
      accessToken,
      refreshToken,
    });
    console.log(`Demo user created: ${user.email}`);

    console.log(" Database seeded successfully");
  } catch (error) {
    console.error("Something went wrong seeding", error.message, error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
