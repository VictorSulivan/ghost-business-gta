import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { sealSession, sessionCookieOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import { discordStateCookie, exchangeDiscordCode } from "@/lib/discord";
import { isUniqueViolation } from "@/lib/format";

function fail(request: NextRequest, code: string) {
  const response = NextResponse.redirect(new URL(`/connexion?erreur=${code}`, request.url));
  response.cookies.delete(discordStateCookie());
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expected = request.cookies.get(discordStateCookie())?.value;
  if (!code || !state || !expected || state !== expected) return fail(request, "discord");

  const identity = await exchangeDiscordCode(request.nextUrl.origin, code);
  if (!identity) return fail(request, "discord");

  const displayName = (identity.global_name || identity.username).slice(0, 80);
  let account = await db.query.users.findFirst({ where: eq(users.discordId, identity.id) });

  if (!account) {
    const userId = crypto.randomUUID();
    try {
      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          id: userId,
          discordId: identity.id,
          discordUsername: identity.username,
          role: "client",
        });
        await tx.insert(profiles).values({ userId, characterName: displayName });
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
    account = await db.query.users.findFirst({ where: eq(users.discordId, identity.id) });
  } else {
    await db.update(users).set({ discordUsername: identity.username }).where(eq(users.id, account.id));
  }

  if (!account || !account.active) return fail(request, "acces");

  const token = await sealSession(account.id, account.role);
  const response = NextResponse.redirect(new URL(account.role === "client" ? "/espace" : "/bureau", request.url));
  response.cookies.set("session", token, sessionCookieOptions);
  response.cookies.delete(discordStateCookie());
  return response;
}
