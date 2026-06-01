import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Ejemplo de tabla de productos para Stock Enigma
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category'),
  price: real('price').notNull(),
  currentStock: integer('current_stock').notNull().default(0),
  minStock: integer('min_stock').notNull().default(5),
  status: text('status').notNull().default('active'),
  imageUrl: text('image_url'),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  replenishmentStatus: text('replenishment_status').notNull().default('none'),
  requestedQuantity: integer('requested_quantity').notNull().default(0),
});

// Better-Auth Tables
export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull()
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id)
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
	refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull()
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }),
	updatedAt: integer("updatedAt", { mode: "timestamp" })
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const replenishmentLogs = sqliteTable("replenishment_logs", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  quantityAdded: integer("quantity_added").notNull(),
  receivedAt: integer("received_at", { mode: "timestamp" }).notNull(),
});

export const replenishmentOrders = sqliteTable("replenishment_orders", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("en_curso"), // 'en_curso', 'recibido', 'cancelado'
});

export const replenishmentOrderItems = sqliteTable("replenishment_order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => replenishmentOrders.id),
  productId: text("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
});
