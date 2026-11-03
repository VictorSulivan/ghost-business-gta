import "server-only";

const STATE_COOKIE = "discord_oauth_state";

export function discordStateCookie() {
  return STATE_COOKIE;
}

export function discordConfigured() {
  return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
}

export function discordRedirectUri(origin: string) {
  return process.env.DISCORD_REDIRECT_URI || `${origin}/auth/discord/callback`;
}

export function discordAuthorizeUrl(origin: string, state: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId || !process.env.DISCORD_CLIENT_SECRET) return null;
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", discordRedirectUri(origin));
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", state);
  return url.toString();
}

type DiscordIdentity = {
  id: string;
  username: string;
  global_name: string | null;
};

export async function exchangeDiscordCode(origin: string, code: string): Promise<DiscordIdentity | null> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: discordRedirectUri(origin),
    }),
  });
  if (!tokenResponse.ok) return null;
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) return null;

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!userResponse.ok) return null;
  const user = (await userResponse.json()) as Partial<DiscordIdentity>;
  if (!user.id || !user.username) return null;
  return { id: user.id, username: user.username, global_name: user.global_name ?? null };
}
