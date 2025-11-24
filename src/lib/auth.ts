import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const DEMO_USER = {
  id: "demo-user",
  email: "demo@example.com",
  name: "Demo User",
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

        // デモ用: 固定ユーザー + パスワード "demo" を許可
        if (email === DEMO_USER.email && password === "demo") {
          return DEMO_USER;
        }

        // もしDBにユーザーが存在すればデモ認証として通す（本実装ではパスワードハッシュを必須に）
        if (email) {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user && password === "demo") {
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
