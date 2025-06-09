const { prisma, bcrypt } = require("../src/common/common");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const WEB_TOKEN = process.env.WEB_TOKEN || "1234";
const { faker } = require("@faker-js/faker");

async function main() {
  const adminUser = await prisma.user.create({
    data: {
      firstName: "example",
      lastName: "exampleTwo",
      email: "admin@example.com",
      password: "hashed_admin_password", // Use bcrypt or a similar library for hashing
      isAdmin: true,
    },
  });

  console.log("Admin user created:", adminUser);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// seed a single refresh token
const seedRefreshToken = async () => {
  // delete old seeded tokens
  await prisma.token.deleteMany();

  await prisma.token.create({
    data: {
      refreshToken: "placeholder",
    },
  });
};
seedRefreshToken();

async function seed() {
  // Clear database
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

  // Create users for all the companies
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
      //Token
      const token = jwt.sign({ id: user.id, email: user.email }, WEB_TOKEN, {
        expiresIn: "1d",
      });
      seededTokens.push({ email: user.email, token });
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
    //Token
    const token = jwt.sign({ id: user.id, email: user.email }, WEB_TOKEN, {
      expiresIn: "1d",
    });
    seededTokens.push({ email: user.email, token });
  }

  //create admin role for Cathy and Shelle
  const cathyPassword = "cathytest";
  const hashedCathyPassword = await bcrypt.hash(cathyPassword, 10);
  const cathyUser = await prisma.user.create({
    data: {
      firstName: "Cathy",
      lastName: "Cutrone",
      email: "ccutrone@onpointsolutionsgroup.org",
      password: hashedCathyPassword,
      isAdmin: true,
    },
  });
  console.log("Cathy Admin user created:");

  const shellePassword = "shelletest";
  const hashedShellePassword = await bcrypt.hash(shellePassword, 10);
  const shelleUser = await prisma.user.create({
    data: {
      firstName: "Shelle",
      lastName: "Zachary",
      email: "szachary@onpointsolutionsgroup.org",
      password: hashedShellePassword,
      isAdmin: true,
    },
  });
  console.log("Shelle Admin user created:");

  // log tokens (Might want to copy and paste this somewhere for testing)
  seededTokens.forEach(({ email, token }) => {
    console.log(`${email}:           ${token}`);
    console.log(" Database seeded");
  });
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
