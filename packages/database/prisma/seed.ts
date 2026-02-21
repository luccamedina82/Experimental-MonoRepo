import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcryptjs from "bcryptjs";
import "dotenv/config";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const hashedPassword1 = await bcryptjs.hash("password123", 10);
  const hashedPassword2 = await bcryptjs.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "admin@padelgo.com" },
    update: {},
    create: {
      email: "admin@padelgo.com",
      password: hashedPassword1,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "usuario@padelgo.com" },
    update: {},
    create: {
      email: "usuario@padelgo.com",
      password: hashedPassword2,
    },
  });

  console.log("Seeded users:", { user1, user2 });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
