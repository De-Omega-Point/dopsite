"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "./admin-auth";

async function getDatabase() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Platform database is unavailable");
  return env.DB;
}

async function ensureTable() {
  const database = await getDatabase();
  await database.prepare(`CREATE TABLE IF NOT EXISTS platform_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    price_cents INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
}

export async function createProduct(formData: FormData) {
  await requirePlatformAdmin();
  await ensureTable();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  if (!title || !category || !description || !Number.isFinite(price) || price < 0) return;
  const now = Math.floor(Date.now() / 1000);
  const database = await getDatabase();
  await database.prepare("INSERT INTO platform_products (title, category, description, price_cents, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'draft', ?, ?)")
    .bind(title, category, description, Math.round(price * 100), now, now).run();
  revalidatePath("/admin");
}

export async function setProductStatus(formData: FormData) {
  await requirePlatformAdmin();
  await ensureTable();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || !["draft", "published", "archived"].includes(status)) return;
  const database = await getDatabase();
  await database.prepare("UPDATE platform_products SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, Math.floor(Date.now() / 1000), id).run();
  revalidatePath("/admin");
}

export async function deleteProduct(formData: FormData) {
  await requirePlatformAdmin();
  await ensureTable();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  const database = await getDatabase();
  await database.prepare("DELETE FROM platform_products WHERE id = ?").bind(id).run();
  revalidatePath("/admin");
}

export async function duplicateProduct(formData: FormData) {
  await requirePlatformAdmin();
  await ensureTable();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  const database = await getDatabase();
  const now = Math.floor(Date.now() / 1000);
  await database.prepare(`INSERT INTO platform_products (title, category, description, price_cents, status, created_at, updated_at)
    SELECT title || ' — Copy', category, description, price_cents, 'draft', ?, ? FROM platform_products WHERE id = ?`)
    .bind(now, now, id).run();
  revalidatePath("/admin");
}

export async function listProducts() {
  await ensureTable();
  const database = await getDatabase();
  const result = await database.prepare("SELECT id, title, category, description, price_cents, status, created_at, updated_at FROM platform_products ORDER BY updated_at DESC").all();
  return result.results as Array<{id:number;title:string;category:string;description:string;price_cents:number;status:string;created_at:number;updated_at:number}>;
}

export async function listVisibilityLeads() {
  await requirePlatformAdmin();
  const database = await getDatabase();
  const result = await database.prepare("SELECT id, email, business_url, business_name, category, location, score, created_at FROM visibility_leads ORDER BY created_at DESC LIMIT 100").all();
  return result.results as Array<{id:number;email:string;business_url:string;business_name:string;category:string;location:string;score:number;created_at:number}>;
}
