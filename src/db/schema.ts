import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================
// Better Auth Tables
// ============================================

export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  nik: varchar("nik", { length: 50 }).unique(),
  username: varchar("username", { length: 255 }).unique(),
  image: text("image"),
  role: mysqlEnum("role", ["leader", "supervisor", "plant_manager", "ga", "purchasing"]).notNull().default("leader"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = mysqlTable("accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const verifications = mysqlTable("verifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }),
});

// ============================================
// Application Tables
// ============================================

export const items = mysqlTable("items", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  stock: int("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const requests = mysqlTable("requests", {
  id: int("id").primaryKey().autoincrement(),
  requesterId: varchar("requester_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["menunggu", "disetujui", "diserahkan", "ditolak"])
    .notNull()
    .default("menunggu"),
  purpose: text("purpose"),
  reason: text("reason"),
  reviewedBy: varchar("reviewed_by", { length: 255 }).references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  handedOverBy: varchar("handed_over_by", { length: 255 }).references(() => users.id),
  handedOverAt: timestamp("handed_over_at", { mode: "date" }),
  handoverNote: text("handover_note"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const requestItems = mysqlTable("request_items", {
  id: int("id").primaryKey().autoincrement(),
  requestId: int("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  itemId: int("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  quantity: int("quantity").notNull(),
  note: text("note"),
});

export const stockMovements = mysqlTable("stock_movements", {
  id: int("id").primaryKey().autoincrement(),
  itemId: int("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["masuk", "keluar"]).notNull(),
  quantity: int("quantity").notNull(),
  requestId: int("request_id").references(() => requests.id),
  note: text("note"),
  createdBy: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  requestId: int("request_id").references(() => requests.id),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  requests: many(requests, { relationName: "requester" }),
  reviewedRequests: many(requests, { relationName: "reviewer" }),
  handedOverRequests: many(requests, { relationName: "handoverUser" }),
  notifications: many(notifications),
  stockMovements: many(stockMovements),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  requestItems: many(requestItems),
  stockMovements: many(stockMovements),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  requester: one(users, {
    fields: [requests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  reviewer: one(users, {
    fields: [requests.reviewedBy],
    references: [users.id],
    relationName: "reviewer",
  }),
  handedOverByUser: one(users, {
    fields: [requests.handedOverBy],
    references: [users.id],
    relationName: "handoverUser",
  }),
  requestItems: many(requestItems),
  stockMovements: many(stockMovements),
}));

export const requestItemsRelations = relations(requestItems, ({ one }) => ({
  request: one(requests, {
    fields: [requestItems.requestId],
    references: [requests.id],
  }),
  item: one(items, {
    fields: [requestItems.itemId],
    references: [items.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  item: one(items, {
    fields: [stockMovements.itemId],
    references: [items.id],
  }),
  request: one(requests, {
    fields: [stockMovements.requestId],
    references: [requests.id],
  }),
  createdByUser: one(users, {
    fields: [stockMovements.createdBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  request: one(requests, {
    fields: [notifications.requestId],
    references: [requests.id],
  }),
}));
