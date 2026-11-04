import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
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

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  discordId: text("discord_id").unique(),
  discordUsername: text("discord_username").notNull().default(""),
  role: userRole("role").notNull(),
  vipDiscountCents: integer("vip_discount_cents").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
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
    channel: boolean("channel").notNull().default(false),
    status: requestStatus("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("requests_client_id_idx").on(table.clientId)],
);

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
  requests: many(requests),
  messages: many(messages),
  quotes: many(quotes),
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

export const quoteLinesRelations = relations(quoteLines, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteLines.quoteId],
    references: [quotes.id],
  }),
}));

export const ACTIVE_REQUEST_STATUSES = ["open", "quoted", "accepted"] as const;
export const PAST_REQUEST_STATUSES = ["done", "refused", "cancelled"] as const;
