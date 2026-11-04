CREATE TYPE "public"."staff_function" AS ENUM('commandement', 'renseignement', 'operations', 'cyber', 'alpha', 'logistique');
--> statement-breakpoint
CREATE TYPE "public"."vip_tier" AS ENUM('argent', 'or', 'obsidienne');
--> statement-breakpoint
CREATE TYPE "public"."vip_state" AS ENUM('actif', 'suspendu');
--> statement-breakpoint
CREATE TYPE "public"."service_family" AS ENUM('protection', 'intel', 'tracking', 'intervention', 'special');
--> statement-breakpoint
CREATE TYPE "public"."operation_status" AS ENUM('planned', 'active', 'done', 'suspended');
--> statement-breakpoint
CREATE TYPE "public"."report_kind" AS ENUM('mission', 'intel', 'incident', 'account');
--> statement-breakpoint
CREATE TYPE "public"."report_class" AS ENUM('internal', 'confidential', 'classified');
--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'review', 'validated', 'archived');
--> statement-breakpoint
CREATE TYPE "public"."dossier_kind" AS ENUM('intel', 'surveillance', 'classified');
--> statement-breakpoint
CREATE TYPE "public"."unit_kind" AS ENUM('alpha', 'specialized');
--> statement-breakpoint
CREATE TABLE "function_permissions" (
  "staff_function" "staff_function" PRIMARY KEY,
  "contracts" boolean DEFAULT false NOT NULL,
  "operations" boolean DEFAULT false NOT NULL,
  "staff" boolean DEFAULT false NOT NULL,
  "communications" boolean DEFAULT false NOT NULL,
  "panel" boolean DEFAULT false NOT NULL,
  "access" boolean DEFAULT false NOT NULL,
  "classified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO "function_permissions" ("staff_function", "contracts", "operations", "staff", "communications", "panel", "access", "classified") VALUES
  ('commandement', true, true, true, true, true, true, true),
  ('renseignement', true, false, false, true, false, false, true),
  ('operations', true, true, true, true, false, false, false),
  ('cyber', false, false, false, false, true, false, false),
  ('alpha', false, true, false, false, false, false, false),
  ('logistique', false, false, true, false, false, false, false);
--> statement-breakpoint
CREATE TABLE "units" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "kind" "unit_kind" NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "leader_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "units" ("name", "kind", "description") VALUES
  ('Unité Alpha', 'alpha', 'Cellule d''élite engagée pour les interventions les plus sensibles, sur ordre du commandement.'),
  ('Unités spécialisées', 'specialized', 'Escouades, chefs d''unité, affectations et disponibilités.');
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "staff_function" "staff_function";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "rp_title" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "unit_id" uuid;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "vip_tier" "vip_tier" DEFAULT 'argent' NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "vip_state" "vip_state" DEFAULT 'actif' NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "vip_expires_on" date;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "vip_benefits" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "vip_notes" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "perm_contracts" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "perm_operations" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "perm_staff" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "perm_communications" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "perm_panel" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "perm_access" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "perm_classified" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
UPDATE "users" SET
  "staff_function" = 'commandement',
  "perm_contracts" = true,
  "perm_operations" = true,
  "perm_staff" = true,
  "perm_communications" = true,
  "perm_panel" = true,
  "perm_access" = true,
  "perm_classified" = true
WHERE "role" IN ('officer', 'admin');
--> statement-breakpoint
UPDATE "users" SET
  "staff_function" = 'operations',
  "perm_contracts" = true,
  "perm_operations" = true,
  "perm_staff" = true,
  "perm_communications" = true
WHERE "role" = 'member';
--> statement-breakpoint
CREATE SEQUENCE "request_ref_seq";
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "reference" text;
--> statement-breakpoint
UPDATE "requests" SET "reference" = 'GHO-' || lpad(nextval('request_ref_seq')::text, 4, '0') WHERE "reference" IS NULL;
--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "reference" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "reference" SET DEFAULT ('GHO-' || lpad(nextval('request_ref_seq')::text, 4, '0'));
--> statement-breakpoint
CREATE UNIQUE INDEX "requests_reference_unique" ON "requests" ("reference");
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "service_family" "service_family";
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "location" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "deadline" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "budget_note" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "owner_id" uuid;
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "terms" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "suspended" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "finalized_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE SEQUENCE "operation_ref_seq";
--> statement-breakpoint
CREATE TABLE "operations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reference" text DEFAULT ('OP-' || lpad(nextval('operation_ref_seq')::text, 4, '0')) NOT NULL,
  "name" text NOT NULL,
  "objective" text DEFAULT '' NOT NULL,
  "owner_id" uuid,
  "status" "operation_status" DEFAULT 'planned' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "operations" ADD CONSTRAINT "operations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "operations_reference_unique" ON "operations" ("reference");
--> statement-breakpoint
CREATE TABLE "dossiers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "kind" "dossier_kind" NOT NULL,
  "title" text NOT NULL,
  "body" text DEFAULT '' NOT NULL,
  "author_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE SEQUENCE "report_ref_seq";
--> statement-breakpoint
CREATE TABLE "reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reference" text DEFAULT ('RPT-' || lpad(nextval('report_ref_seq')::text, 4, '0')) NOT NULL,
  "author_id" uuid NOT NULL,
  "unit_name" text DEFAULT '' NOT NULL,
  "kind" "report_kind" NOT NULL,
  "classification" "report_class" NOT NULL,
  "request_id" uuid,
  "title" text NOT NULL,
  "summary" text DEFAULT '' NOT NULL,
  "outcome" text DEFAULT '' NOT NULL,
  "next_steps" text DEFAULT '' NOT NULL,
  "status" "report_status" DEFAULT 'pending' NOT NULL,
  "review" text DEFAULT '' NOT NULL,
  "reviewer_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "reports_reference_unique" ON "reports" ("reference");
--> statement-breakpoint
CREATE TABLE "report_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "report_id" uuid NOT NULL,
  "actor_id" uuid NOT NULL,
  "text" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_events" ADD CONSTRAINT "report_events_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_events" ADD CONSTRAINT "report_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "vip_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "actor_id" uuid NOT NULL,
  "text" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vip_events" ADD CONSTRAINT "vip_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "vip_events" ADD CONSTRAINT "vip_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "audit_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "actor_id" uuid NOT NULL,
  "action" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
