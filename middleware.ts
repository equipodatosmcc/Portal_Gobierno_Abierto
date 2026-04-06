// middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/admin/:path*", "/editor/:path*"], // Rutas protegidas
};
