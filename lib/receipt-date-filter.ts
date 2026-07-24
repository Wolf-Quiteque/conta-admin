import { sql, type SQL } from "drizzle-orm";
import { receipts } from "./db/schema";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISODate(value: string | undefined): value is string {
  return !!value && ISO_DATE_RE.test(value);
}

/** Matches a receipt's user-entered date, falling back to its upload date. */
export function receiptDateFilter(date: string): SQL {
  return sql`coalesce(${receipts.receiptDate}, ${receipts.createdAt}::date) = ${date}`;
}
