import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

// Wiring only: there are no sign-in screens yet. The Register and Log in
// cards add the forms and call signIn() from them.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        if (!(await verifyPassword(password, user.passwordHash))) return null;

        // Never return the password hash: whatever is returned here ends up
        // in the token.
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    // The role travels in the JWT so every request can check it without
    // another database round trip.
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
});
