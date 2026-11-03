import { NextResponse, type NextRequest } from "next/server";
import { discordAuthorizeUrl, discordStateCookie } from "@/lib/discord";

export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const url = discordAuthorizeUrl(request.nextUrl.origin, state);
  if (!url) {
    return NextResponse.redirect(new URL("/connexion?erreur=config", request.url));
  }

  const response = NextResponse.redirect(url);
  response.cookies.set(discordStateCookie(), state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
