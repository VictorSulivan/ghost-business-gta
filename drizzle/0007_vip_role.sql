ALTER TYPE "public"."user_role" ADD VALUE 'vip' BEFORE 'member';
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "channel" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "requests_one_channel_per_client" ON "requests" ("client_id") WHERE "channel";
