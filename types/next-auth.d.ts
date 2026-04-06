// next-auth.d.ts
import { Role } from "@prisma/client"; // Importamos tu Enum de Prisma
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: Role; // Agregamos el rol al objeto User
  }

  interface Session {
    user: {
      role?: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}
