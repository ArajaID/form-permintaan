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

  // 2. Clear all users EXCEPT arajatech@gmail.com
  try {
    const usersToDelete = await db
      .select({ id: schema.users.id, email: schema.users.email })
      .from(schema.users)
      .where(ne(schema.users.email, "arajatech@gmail.com"));

    for (const u of usersToDelete) {
      await db.delete(schema.sessions).where(eq(schema.sessions.userId, u.id));
      await db.delete(schema.accounts).where(eq(schema.accounts.userId, u.id));
    }
    await db.delete(schema.users).where(ne(schema.users.email, "arajatech@gmail.com"));
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

  const existingUsers = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, user.email));
  const existing = existingUsers[0];

  if (existing) {
    await db.update(schema.users)
      .set({
        role: "plant_manager",
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.email, user.email));
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

  // 4. Create sample GA and Purchasing accounts if not exist
  const additionalUsers: {
    name: string;
    email: string;
    password: string;
    role: "leader" | "supervisor" | "plant_manager" | "ga" | "purchasing";
  }[] = [
    { name: "Tim General Affair", email: "ga@unindo.co.id", password: "password123", role: "ga" },
    { name: "Tim Purchasing", email: "purchasing@unindo.co.id", password: "password123", role: "purchasing" },
  ];

  for (const u of additionalUsers) {
    const exList = await db.select().from(schema.users).where(eq(schema.users.email, u.email));
    const ex = exList[0];
    if (ex) {
      await db.update(schema.users).set({ role: u.role, isActive: true, updatedAt: new Date() }).where(eq(schema.users.email, u.email));
      console.log(`✅ User existing diupdate: ${u.email} (${u.role})`);
    } else {
      try {
        await auth.api.signUpEmail({ body: { name: u.name, email: u.email, password: u.password, role: u.role } });
        console.log(`✅ User created: ${u.name} (${u.role}) - ${u.email}`);
      } catch (err: any) {
        console.log(`⚠️ Failed to create user: ${u.email}`, err?.message || "");
      }
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Account Credentials:");
  console.log("   Plant Manager: arajatech@gmail.com / password123");
  console.log("   Tim GA:        ga@unindo.co.id / password123");
  console.log("   Purchasing:    purchasing@unindo.co.id / password123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});

