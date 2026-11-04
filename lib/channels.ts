import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { requests } from "./db/schema";

export const VIP_CHANNEL_TITLE = "Canal permanent";

export async function findVipChannel(clientId: string) {
  return db.query.requests.findFirst({
    where: and(eq(requests.clientId, clientId), eq(requests.channel, true)),
  });
}

export async function ensureVipChannel(clientId: string) {
  const existing = await findVipChannel(clientId);
  if (existing) {
    if (existing.status !== "open") {
      await db.update(requests).set({ status: "open", updatedAt: new Date() }).where(eq(requests.id, existing.id));
    }
    return existing.id;
  }

  const id = crypto.randomUUID();
  await db.insert(requests).values({
    id,
    clientId,
    title: VIP_CHANNEL_TITLE,
    status: "open",
    channel: true,
  });
  return id;
}

export async function closeVipChannel(clientId: string) {
  const existing = await findVipChannel(clientId);
  if (!existing || existing.status === "done") return;
  await db.update(requests).set({ status: "done", updatedAt: new Date() }).where(eq(requests.id, existing.id));
}
