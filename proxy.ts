import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await decrypt(req.cookies.get("session")?.value);
  const isAdmin = Boolean(session?.userId && session.role === "admin");

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAdmin ? "/utilizadores" : "/entrar", req.url),
    );
  }

  if (pathname === "/entrar") {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/utilizadores", req.url));
    }
    return NextResponse.next();
  }

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/entrar", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
