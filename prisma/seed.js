import prisma from "../common/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { faker } from "@faker-js/faker";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


console.log("webToken", process.env.WEB_TOKEN);

// seed a single refresh token
async function seedRefreshToken() {
  // delete old seeded tokens
  await prisma.token.deleteMany();
  await prisma.token.create({
    data: {
      refreshToken: "placeholder",
    },
  });
}

async function seed() {
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  //store all sedded tokens in array
  const seededTokens = [];

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

      const accessToken = jwt.sign({ id: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m"}
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      seededTokens.push({ email: user.email, accessToken, refreshToken });
    }
  }

  // users without company
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

    const accessToken = jwt.sign({ id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m"}
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    seededTokens.push({ email: user.email, accessToken, refreshToken });
  }

  //create admin role for myself
  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const createAdmin = await prisma.user.create({
    data: {
      firstName: "Heather",
      lastName: "DeLiso",
      email: "heatherdeliso@gmail.com",
      password: hashedAdminPassword,
      isAdmin: true,
    },
  });

  const adminAccessToken = jwt.sign(
    { id: createAdmin.id, email: createAdmin.email, isAdmin: true },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const adminRefreshToken = jwt.sign(
    { id: createAdmin.id, email: createAdmin.email, isAdmin: true },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  console.log("Admin user created:", createAdmin.email);
  console.log("Admin token:", adminAccessToken, adminRefreshToken);

  // log tokens
  seededTokens.forEach(({ email, accessToken, refreshToken }) => {
    console.log(`${email}: Access=${accessToken} Refresh=${refreshToken}`);
  });

  console.log(" Database seeded successfully");
}

await seedRefreshToken();
await seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
