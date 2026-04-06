// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"; // El "@" apunta a la raíz de tu proyecto
export const { GET, POST } = handlers;
