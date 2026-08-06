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

  // Create single Plant Manager user via Better Auth
  const user = {
    name: "Abdul Rahman Jamil",
    email: "arajatech@gmail.com",
    password: "password123",
    role: "plant_manager",
  };

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
    console.log(`⚠️  User may already exist: ${user.email}`, error?.message || "");
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
