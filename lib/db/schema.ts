import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

// Platform-level role: distinguishes NAWA Contas staff (conta-admin) from
// company users (conta-clientes). Unrelated to `companyRole` below.
export const userRoleEnum = pgEnum("user_role", ["cliente", "admin"]);

// Approval status now lives on the company, not the individual user — every
// member inherits their company's status.
export const companyStatusEnum = pgEnum("company_status", [
  "pendente",
  "aprovado",
  "rejeitado",
]);

// Per-company role for `cliente` users: "admin" can add members, "gestor"
// can only upload receipts.
export const companyRoleEnum = pgEnum("company_role", ["admin", "gestor"]);

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nif: text("nif").notNull(),
  address: text("address").notNull(),
  contact: text("contact").notNull(),
  status: companyStatusEnum("status").notNull().default("pendente"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("cliente"),
  companyId: uuid("company_id").references(() => companies.id, {
    onDelete: "cascade",
  }),
  companyRole: companyRoleEnum("company_role"),
  isOwner: boolean("is_owner").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  imagePathname: text("image_pathname").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  receiptDate: date("receipt_date"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;
