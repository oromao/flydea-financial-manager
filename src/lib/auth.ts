import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { checkRateLimit } from "./rate-limit";

interface CustomUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        console.log("Tentativa de login para:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.error("Credenciais ausentes");
          throw new Error("Email e senha obrigatórios");
        }

        try {
          const { success } = await checkRateLimit(`login:${credentials.email}`);
          if (!success) {
            console.error("Rate limit excedido para:", credentials.email);
            throw new Error("Muitas tentativas. Tente novamente em 60 segundos.");
          }
        } catch (e) {
          console.error("Erro no checkRateLimit, prosseguindo:", e);
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            console.error("Usuário não encontrado no BD:", credentials.email);
            throw new Error("Usuário não encontrado");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error("Senha inválida para:", credentials.email);
            throw new Error("Senha inválida");
          }

          console.log("Login autorizado com sucesso para:", credentials.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatarUrl,
            role: user.role,
          };
        } catch (error) {
          console.error("Erro na validação do Prisma/Bcrypt:", error);
          throw error;
        }
      }
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.role = customUser.role;
        token.image = customUser.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | undefined;
        session.user.image = token.image as string | null | undefined;
        session.user.avatarUrl = token.image as string | null | undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "flydea-recovery-secret-2026-xyz987",
};
