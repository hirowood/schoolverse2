import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const DEMO_USER = {
  id: "demo-user",
  email: "demo@example.com",
  name: "Demo User",
  password: "demo1234",
};

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        // Demo: predefined user with demo password
        if (email === DEMO_USER.email && password === DEMO_USER.password) {
          return DEMO_USER;
        }

        // Verify against DB users
        if (email) {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user) {
            if (user.passwordHash) {
              const ok = await bcrypt.compare(password, user.passwordHash);
              if (!ok) return null;
            } else {
              // For seed users without passwordHash, allow demo password
              if (password !== DEMO_USER.password) return null;
            }
            return {
              id: user.id,
              email: user.email,
              name: user.name ?? user.email,
            };
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
