CREATE TYPE "public"."quote_adjustment" AS ENUM('none', 'discount', 'increase');--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "adjustment" "quote_adjustment" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "adjustment_bps" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "adjustment_reason" text DEFAULT '' NOT NULL;
