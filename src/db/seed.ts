import { db } from "./index";
import * as schema from "./schema";
import { auth } from "../lib/auth";
import { ne, eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...\n");

  // 1. Clear items, requests, movements, notifications
  try {
    await db.delete(schema.requestItems);
    await db.delete(schema.stockMovements);
    await db.delete(schema.notifications);
    await db.delete(schema.requests);
    await db.delete(schema.items);
    console.log("🗑️  Semua data barang, permintaan, dan pergerakan stok berhasil dihapus.");
  } catch (err: any) {
    console.log("⚠️ Error clearing items tables:", err?.message || err);
  }

  // 2. Clear all users, sessions, accounts
  try {
    await db.delete(schema.sessions);
    await db.delete(schema.accounts);
    await db.delete(schema.users);
    console.log("🗑️  Semua user, sesi, dan akun berhasil dibersihkan.");
  } catch (err: any) {
    console.log("⚠️ Error deleting users:", err?.message || err);
  }

  // 3. Define initial users with NIK and password equal to NIK
  const initialUsers: {
    name: string;
    nik: string;
    email: string;
    password: string;
    role: "leader" | "supervisor" | "plant_manager" | "ga" | "purchasing";
  }[] = [
    {
      name: "Abdul Rahman Jamil",
      nik: "800001",
      email: "800001@unindo.co.id",
      password: "800001",
      role: "plant_manager",
    },
    {
      name: "Tim General Affair",
      nik: "800002",
      email: "800002@unindo.co.id",
      password: "800002",
      role: "ga",
    },
    {
      name: "Tim Purchasing",
      nik: "800003",
      email: "800003@unindo.co.id",
      password: "800003",
      role: "purchasing",
    },
  ];

  for (const u of initialUsers) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          nik: u.nik,
        },
      });

      if (res?.user) {
        await db
          .update(schema.users)
          .set({
            nik: u.nik,
            username: u.nik,
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, res.user.id));
      }
      console.log(`✅ User created: ${u.name} (NIK: ${u.nik}, Role: ${u.role})`);
    } catch (error: any) {
      console.log(`⚠️  Failed to create user: ${u.nik} (${u.name})`, error?.message || "");
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Account Credentials (NIK / Password):");
  console.log("   Plant Manager : 800001 / 800001");
  console.log("   Tim GA        : 800002 / 800002");
  console.log("   Purchasing    : 800003 / 800003");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});

