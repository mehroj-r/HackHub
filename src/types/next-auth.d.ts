import type { DefaultSession } from "next-auth";

import type { Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    // id is token.sub, copied over in the session callback in src/auth.ts.
    user: { id: string; role: Role } & DefaultSession["user"];
  }
}

// next-auth/jwt only re-exports this module, so the JWT interface has to be
// widened where it is declared.
declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
  }
}
