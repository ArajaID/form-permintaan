import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import { auth } from "../lib/auth";
import { ne, eq } from "drizzle-orm";

const sqlite = new Database(path.join(process.cwd(), "local.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("🌱 Seeding database...\n");

  // 1. Clear items, requests, movements, notifications
  try {
    db.delete(schema.requestItems).run();
    db.delete(schema.stockMovements).run();
    db.delete(schema.notifications).run();
    db.delete(schema.requests).run();
    db.delete(schema.items).run();
    console.log("🗑️  Semua data barang, permintaan, dan pergerakan stok berhasil dihapus.");
  } catch (err: any) {
    console.log("⚠️ Error clearing items tables:", err?.message || err);
  }

  // 2. Clear all users EXCEPT arajatech@gmail.com
  try {
    const usersToDelete = db
      .select({ id: schema.users.id, email: schema.users.email })
      .from(schema.users)
      .where(ne(schema.users.email, "arajatech@gmail.com"))
      .all();

    for (const u of usersToDelete) {
      db.delete(schema.sessions).where(eq(schema.sessions.userId, u.id)).run();
      db.delete(schema.accounts).where(eq(schema.accounts.userId, u.id)).run();
    }
    db.delete(schema.users).where(ne(schema.users.email, "arajatech@gmail.com")).run();
    console.log(`🗑️  ${usersToDelete.length} user lain berhasil dihapus (hanya menyisakan arajatech@gmail.com).`);
  } catch (err: any) {
    console.log("⚠️ Error deleting other users:", err?.message || err);
  }

  // 3. Ensure arajatech@gmail.com exists with plant_manager role
  const user = {
    name: "Abdul Rahman Jamil",
    email: "arajatech@gmail.com",
    password: "password123",
    role: "plant_manager",
  };

  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, user.email))
    .get();

  if (existing) {
    db.update(schema.users)
      .set({
        role: "plant_manager",
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.email, user.email))
      .run();
    console.log(`✅ User existing diupdate ke plant_manager: ${user.email}`);
  } else {
    try {
      await auth.api.signUpEmail({
        body: {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
        },
      });
      console.log(`✅ User created: ${user.name} (${user.role}) - ${user.email}`);
    } catch (error: any) {
      console.log(`⚠️  Failed to create user: ${user.email}`, error?.message || "");
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Account Credentials:");
  console.log("   Plant Manager: arajatech@gmail.com / password123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
