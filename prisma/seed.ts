// Creates the first organizer (Decision 7) and, locally and in CI, a few demo
// users. See docs/07-system-design.md > Seed. Run it with `npx prisma db seed`;
// Prisma 7 never runs it for you after `migrate dev` or `migrate reset`.
//
// It upserts by email, so it is safe on every deploy. An existing user keeps
// their password: the seed only makes sure the role is right.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import type { z } from "zod";

import { PrismaClient } from "../src/generated/prisma/client";
import type { Role } from "../src/generated/prisma/enums";
import { hashPassword } from "../src/lib/password";
import { emailSchema, passwordSchema } from "../src/lib/validation/auth";
import { DEMO_USERS } from "./demo-users";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function readVariable(name: string, schema: z.ZodType<string>): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`${name} is not set. See .env.example.`);
  }
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`${name}: ${result.error.issues[0].message}`);
  }
  return result.data;
}

async function upsertUser(email: string, password: string, role: Role) {
  await prisma.user.upsert({
    where: { email },
    update: { role },
    create: { email, passwordHash: await hashPassword(password), role },
  });
  console.log(`Seeded ${role.toLowerCase()} ${email}`);
}

async function main() {
  const organizerEmail = readVariable("SEED_ORGANIZER_EMAIL", emailSchema);
  const organizerPassword = readVariable(
    "SEED_ORGANIZER_PASSWORD",
    passwordSchema,
  );
  await upsertUser(organizerEmail, organizerPassword, "ORGANIZER");

  // Local and CI only, never production.
  if (process.env.SEED_DEMO_USERS === "true") {
    const demoPassword = readVariable("SEED_DEMO_PASSWORD", passwordSchema);
    for (const { email, role } of DEMO_USERS) {
      await upsertUser(email, demoPassword, role);
    }
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
