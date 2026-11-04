import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { decrypt, homePath, isClient, isStaff } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await decrypt(request.cookies.get("session")?.value);
  const isEspace = pathname.startsWith("/espace");
  const isBureau = pathname.startsWith("/bureau");

  if ((isEspace || isBureau) && !session) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  if (isEspace && !(session && isClient(session.role))) {
    return NextResponse.redirect(new URL("/bureau", request.url));
  }

  if (isBureau && !(session && isStaff(session.role))) {
    return NextResponse.redirect(new URL("/espace", request.url));
  }

  if (session && (pathname === "/connexion" || pathname === "/inscription")) {
    const destination = homePath(session.role);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
