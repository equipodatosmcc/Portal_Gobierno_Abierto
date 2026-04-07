// auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.BETTER_AUTH_SECRET;

if (!authSecret) {
  throw new Error("Falta NEXTAUTH_SECRET (o BETTER_AUTH_SECRET) para firmar sesiones JWT.");
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Usamos JWT para la sesión
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Si el usuario no existe o no tiene password (ej: se registró con Google)
        if (!user || !user.password) return null;

        // COMPARACIÓN SEGURA CON BCRYPT
        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isValid) return null;

        // Devolvemos el usuario (esto se guarda en el JWT)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // Importante para tu panel de Gobierno
        };
      },
    }),
  ],
  // Callbacks para pasar el ROL del usuario a la sesión de React
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
};
