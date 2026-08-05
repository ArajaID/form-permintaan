import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import { auth } from "../lib/auth";

const sqlite = new Database(path.join(process.cwd(), "local.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Create demo users via Better Auth
  const demoUsers = [
    {
      name: "Budi Santoso",
      email: "leader@demo.com",
      password: "password123",
      role: "leader",
    },
    {
      name: "Dewi Sartika",
      email: "supervisor@demo.com",
      password: "password123",
      role: "supervisor",
    },
    {
      name: "Ahmad Wijaya",
      email: "pm@demo.com",
      password: "password123",
      role: "plant_manager",
    },
  ];

  for (const user of demoUsers) {
    try {
      const ctx = await auth.api.signUpEmail({
        body: {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
        },
      });
      console.log(`✅ User created: ${user.name} (${user.role}) - ${user.email}`);
    } catch (error: any) {
      console.log(`⚠️  User may already exist: ${user.email}`, error?.message || "");
    }
  }

  // Create demo items
  const demoItems = [
    { name: "Sarung Tangan Karet", unit: "pasang" },
    { name: "Masker N95", unit: "pcs" },
    { name: "Masker Medis", unit: "box" },
    { name: "Pulpen Hitam", unit: "pcs" },
    { name: "Pulpen Merah", unit: "pcs" },
    { name: "Lakban Bening", unit: "roll" },
    { name: "Lakban Coklat", unit: "roll" },
    { name: "Cutter Besar", unit: "pcs" },
    { name: "Isi Cutter", unit: "pack" },
    { name: "Tali Rafia", unit: "roll" },
    { name: "Plastik Wrapping", unit: "roll" },
    { name: "Kertas HVS A4", unit: "rim" },
    { name: "Spidol Permanen", unit: "pcs" },
    { name: "Gunting", unit: "pcs" },
    { name: "Isolasi Listrik", unit: "roll" },
    { name: "Kacamata Safety", unit: "pcs" },
    { name: "Ear Plug", unit: "pasang" },
    { name: "Helm Safety", unit: "pcs" },
    { name: "Sepatu Safety", unit: "pasang" },
    { name: "Jas Hujan", unit: "pcs" },
  ];

  const now = new Date();

  for (const item of demoItems) {
    try {
      db.insert(schema.items)
        .values({
          name: item.name,
          unit: item.unit,
          stock: 0,
          createdAt: now,
        })
        .run();
      console.log(`✅ Item created: ${item.name} (${item.unit})`);
    } catch (error: any) {
      console.log(`⚠️  Item may already exist: ${item.name}`);
    }
  }

  // Get all items and the supervisor user for stock movements
  const allItems = db.select().from(schema.items).all();
  const allUsers = db.select().from(schema.users).all();
  const supervisor = allUsers.find((u) => u.role === "supervisor");

  if (supervisor && allItems.length > 0) {
    // Add initial stock for the first 10 items
    for (let i = 0; i < Math.min(10, allItems.length); i++) {
      const item = allItems[i];
      const qty = Math.floor(Math.random() * 50) + 20;

      db.insert(schema.stockMovements)
        .values({
          itemId: item.id,
          type: "masuk",
          quantity: qty,
          createdBy: supervisor.id,
          note: "Stok awal",
          createdAt: now,
        })
        .run();

      db.update(schema.items)
        .set({ stock: qty })
        .where(
          require("drizzle-orm").eq(schema.items.id, item.id)
        )
        .run();

      console.log(`✅ Stock added: ${item.name} = ${qty} ${item.unit}`);
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Demo Accounts:");
  console.log("   Leader:        leader@demo.com / password123");
  console.log("   Supervisor:    supervisor@demo.com / password123");
  console.log("   Plant Manager: pm@demo.com / password123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
