import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const email = process.env.SEED_MEMBER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_MEMBER_PASSWORD;
  const characterName = process.env.SEED_MEMBER_NAME?.trim();

  if (!email || !password || !characterName) {
    throw new Error("SEED_MEMBER_EMAIL, SEED_MEMBER_PASSWORD et SEED_MEMBER_NAME sont requis.");
  }
  if (password.length < 8) {
    throw new Error("SEED_MEMBER_PASSWORD doit faire au moins 8 caractères.");
  }

  const { hash } = await import("bcrypt");
  const { eq } = await import("drizzle-orm");
  const { db } = await import("../lib/db");
  const { profiles, users } = await import("../lib/db/schema");

  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.role, "admin"),
  });
  if (existingAdmin) {
    console.log("Un administrateur existe déjà. Seed ignoré.");
    await db.$client.end();
    return;
  }

  const passwordHash = await hash(password, 12);
  const userId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      email,
      passwordHash,
      role: "admin",
    });
    await tx.insert(profiles).values({
      userId,
      characterName,
    });
  });

  console.log(`Membre créé : ${email}`);
  await db.$client.end();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
