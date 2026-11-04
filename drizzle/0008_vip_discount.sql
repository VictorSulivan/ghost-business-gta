ALTER TABLE "users" ADD COLUMN "vip_discount_cents" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "vip_discount_cents" integer DEFAULT 0 NOT NULL;
