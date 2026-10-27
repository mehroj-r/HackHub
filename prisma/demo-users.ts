import type { Role } from "../src/generated/prisma/enums";

// The demo accounts both seeds create, all with SEED_DEMO_PASSWORD. In its own
// file because seed.ts runs main() when imported.

/** One judge and three participants, for e2e and manual testing (seed.ts). */
export const DEMO_USERS: { email: string; role: Role }[] = [
  { email: "judge@hackhub.test", role: "JUDGE" },
  { email: "participant1@hackhub.test", role: "PARTICIPANT" },
  { email: "participant2@hackhub.test", role: "PARTICIPANT" },
  { email: "participant3@hackhub.test", role: "PARTICIPANT" },
];
