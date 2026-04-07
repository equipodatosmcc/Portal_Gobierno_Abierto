import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.BETTER_AUTH_SECRET;
  let token = null;

  try {
    token = await getToken({ req, secret: authSecret });
  } catch {
    token = null;
  }

  const { pathname, search } = req.nextUrl;

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (pathname.startsWith("/admin") && !token) {
    const loginUrl = new URL("/login", req.url);
    const callbackUrl = `${pathname}${search}`;

    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
