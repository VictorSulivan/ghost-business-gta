import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["client", "vip", "member", "officer", "admin"]);
export const requestStatus = pgEnum("request_status", [
  "open",
  "quoted",
  "accepted",
  "done",
  "refused",
  "cancelled",
]);
export const quoteStatus = pgEnum("quote_status", [
  "draft",
  "sent",
  "accepted",
  "refused",
]);
export const quoteAdjustment = pgEnum("quote_adjustment", ["none", "discount", "increase"]);
export const quoteLineKind = pgEnum("quote_line_kind", [
  "service",
  "staff",
  "equipment",
  "custom",
]);
export const staffFunction = pgEnum("staff_function", [
  "commandement",
  "renseignement",
  "operations",
  "cyber",
  "alpha",
  "logistique",
]);
export const vipTier = pgEnum("vip_tier", ["argent", "or", "obsidienne"]);
export const vipState = pgEnum("vip_state", ["actif", "suspendu"]);
export const serviceFamily = pgEnum("service_family", [
  "protection",
  "intel",
  "tracking",
  "intervention",
  "special",
]);
export const operationStatus = pgEnum("operation_status", ["planned", "active", "done", "suspended"]);
export const reportKind = pgEnum("report_kind", ["mission", "intel", "incident", "account"]);
export const reportClass = pgEnum("report_class", ["internal", "confidential", "classified"]);
export const reportStatus = pgEnum("report_status", ["pending", "review", "validated", "archived"]);
export const dossierKind = pgEnum("dossier_kind", ["intel", "surveillance", "classified"]);
export const unitKind = pgEnum("unit_kind", ["alpha", "specialized"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  discordId: text("discord_id").unique(),
  discordUsername: text("discord_username").notNull().default(""),
  role: userRole("role").notNull(),
  staffFunction: staffFunction("staff_function"),
  rpTitle: text("rp_title").notNull().default(""),
  unitId: uuid("unit_id"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  vipDiscountCents: integer("vip_discount_cents").notNull().default(0),
  vipTier: vipTier("vip_tier").notNull().default("argent"),
  vipState: vipState("vip_state").notNull().default("actif"),
  vipExpiresOn: date("vip_expires_on"),
  vipBenefits: text("vip_benefits").notNull().default(""),
  vipNotes: text("vip_notes").notNull().default(""),
  permContracts: boolean("perm_contracts").notNull().default(false),
  permOperations: boolean("perm_operations").notNull().default(false),
  permStaff: boolean("perm_staff").notNull().default(false),
  permCommunications: boolean("perm_communications").notNull().default(false),
  permPanel: boolean("perm_panel").notNull().default(false),
  permAccess: boolean("perm_access").notNull().default(false),
  permClassified: boolean("perm_classified").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  kind: unitKind("kind").notNull(),
  description: text("description").notNull().default(""),
  leaderId: uuid("leader_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const functionPermissions = pgTable("function_permissions", {
  staffFunction: staffFunction("staff_function").primaryKey(),
  contracts: boolean("contracts").notNull().default(false),
  operations: boolean("operations").notNull().default(false),
  staff: boolean("staff").notNull().default(false),
  communications: boolean("communications").notNull().default(false),
  panel: boolean("panel").notNull().default(false),
  access: boolean("access").notNull().default(false),
  classified: boolean("classified").notNull().default(false),
});

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  characterName: text("character_name").notNull(),
  phone: text("phone").notNull().default(""),
  description: text("description").notNull().default(""),
  notes: text("notes").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  basePriceCents: integer("base_price_cents").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  notes: text("notes").notNull().default(""),
  priceCents: integer("price_cents").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const equipment = pgTable("equipment", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  notes: text("notes").notNull().default(""),
  priceCents: integer("price_cents").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const requests = pgTable(
  "requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    reference: text("reference")
      .notNull()
      .default(sql`'GHO-' || lpad(nextval('request_ref_seq')::text, 4, '0')`),
    channel: boolean("channel").notNull().default(false),
    serviceFamily: serviceFamily("service_family"),
    location: text("location").notNull().default(""),
    deadline: text("deadline").notNull().default(""),
    budgetNote: text("budget_note").notNull().default(""),
    ownerId: uuid("owner_id").references(() => users.id),
    terms: text("terms").notNull().default(""),
    suspended: boolean("suspended").notNull().default(false),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }),
    status: requestStatus("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("requests_client_id_idx").on(table.clientId),
    uniqueIndex("requests_reference_unique").on(table.reference),
  ],
);

export const operations = pgTable("operations", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference")
    .notNull()
    .default(sql`'OP-' || lpad(nextval('operation_ref_seq')::text, 4, '0')`),
  name: text("name").notNull(),
  objective: text("objective").notNull().default(""),
  ownerId: uuid("owner_id").references(() => users.id),
  status: operationStatus("status").notNull().default("planned"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dossiers = pgTable("dossiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: dossierKind("kind").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference")
    .notNull()
    .default(sql`'RPT-' || lpad(nextval('report_ref_seq')::text, 4, '0')`),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  unitName: text("unit_name").notNull().default(""),
  kind: reportKind("kind").notNull(),
  classification: reportClass("classification").notNull(),
  requestId: uuid("request_id").references(() => requests.id),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  outcome: text("outcome").notNull().default(""),
  nextSteps: text("next_steps").notNull().default(""),
  status: reportStatus("status").notNull().default("pending"),
  review: text("review").notNull().default(""),
  reviewerId: uuid("reviewer_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reportEvents = pgTable("report_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vipEvents = pgTable("vip_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("messages_request_id_idx").on(table.requestId)],
);

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    status: quoteStatus("status").notNull().default("draft"),
    note: text("note").notNull().default(""),
    adjustment: quoteAdjustment("adjustment").notNull().default("none"),
    adjustmentBps: integer("adjustment_bps").notNull().default(0),
    adjustmentReason: text("adjustment_reason").notNull().default(""),
    vipDiscountCents: integer("vip_discount_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("quotes_request_id_idx").on(table.requestId)],
);

export const quoteLines = pgTable(
  "quote_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    kind: quoteLineKind("kind").notNull(),
    refId: uuid("ref_id"),
    label: text("label").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("quote_lines_quote_id_idx").on(table.quoteId)],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  unit: one(units, {
    fields: [users.unitId],
    references: [units.id],
    relationName: "unitMembers",
  }),
  requests: many(requests, { relationName: "clientRequests" }),
  ownedRequests: many(requests, { relationName: "ownedRequests" }),
  ledUnits: many(units, { relationName: "unitLeader" }),
  authoredReports: many(reports, { relationName: "reportAuthor" }),
  reviewedReports: many(reports, { relationName: "reportReviewer" }),
  vipSubjectEvents: many(vipEvents, { relationName: "vipSubject" }),
  vipActorEvents: many(vipEvents, { relationName: "vipActor" }),
  messages: many(messages),
  quotes: many(quotes),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  leader: one(users, {
    fields: [units.leaderId],
    references: [users.id],
    relationName: "unitLeader",
  }),
  members: many(users, { relationName: "unitMembers" }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  client: one(users, {
    fields: [requests.clientId],
    references: [users.id],
    relationName: "clientRequests",
  }),
  owner: one(users, {
    fields: [requests.ownerId],
    references: [users.id],
    relationName: "ownedRequests",
  }),
  messages: many(messages),
  quotes: many(quotes),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  request: one(requests, {
    fields: [messages.requestId],
    references: [requests.id],
  }),
  author: one(users, {
    fields: [messages.authorId],
    references: [users.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  request: one(requests, {
    fields: [quotes.requestId],
    references: [requests.id],
  }),
  author: one(users, {
    fields: [quotes.authorId],
    references: [users.id],
  }),
  lines: many(quoteLines),
}));

export const operationsRelations = relations(operations, ({ one }) => ({
  owner: one(users, {
    fields: [operations.ownerId],
    references: [users.id],
    relationName: "operationOwner",
  }),
}));

export const dossiersRelations = relations(dossiers, ({ one }) => ({
  author: one(users, {
    fields: [dossiers.authorId],
    references: [users.id],
    relationName: "dossierAuthor",
  }),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  author: one(users, {
    fields: [reports.authorId],
    references: [users.id],
    relationName: "reportAuthor",
  }),
  reviewer: one(users, {
    fields: [reports.reviewerId],
    references: [users.id],
    relationName: "reportReviewer",
  }),
  request: one(requests, {
    fields: [reports.requestId],
    references: [requests.id],
  }),
  events: many(reportEvents),
}));

export const reportEventsRelations = relations(reportEvents, ({ one }) => ({
  report: one(reports, {
    fields: [reportEvents.reportId],
    references: [reports.id],
  }),
  actor: one(users, {
    fields: [reportEvents.actorId],
    references: [users.id],
    relationName: "reportEventActor",
  }),
}));

export const vipEventsRelations = relations(vipEvents, ({ one }) => ({
  user: one(users, {
    fields: [vipEvents.userId],
    references: [users.id],
    relationName: "vipSubject",
  }),
  actor: one(users, {
    fields: [vipEvents.actorId],
    references: [users.id],
    relationName: "vipActor",
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(users, {
    fields: [auditLog.actorId],
    references: [users.id],
    relationName: "auditActor",
  }),
}));

export const quoteLinesRelations = relations(quoteLines, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteLines.quoteId],
    references: [quotes.id],
  }),
}));

export const ACTIVE_REQUEST_STATUSES = ["open", "quoted", "accepted"] as const;
export const PAST_REQUEST_STATUSES = ["done", "refused", "cancelled"] as const;
