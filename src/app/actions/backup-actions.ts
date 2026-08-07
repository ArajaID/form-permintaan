"use server";

import { db, pool } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function verifyPlantManager() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "plant_manager") {
    throw new Error("Akses ditolak: Hanya Plant Manager yang diperbolehkan mengakses fitur Backup & Restore");
  }

  return session;
}

export async function createDatabaseBackup() {
  await verifyPlantManager();

  try {
    const backupData = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      data: {
        users: await db.select().from(schema.users),
        sessions: await db.select().from(schema.sessions),
        accounts: await db.select().from(schema.accounts),
        verifications: await db.select().from(schema.verifications),
        items: await db.select().from(schema.items),
        requests: await db.select().from(schema.requests),
        requestItems: await db.select().from(schema.requestItems),
        stockMovements: await db.select().from(schema.stockMovements),
        notifications: await db.select().from(schema.notifications),
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const base64Data = Buffer.from(jsonString).toString("base64");

    const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `database-backup-${dateStr}.json`;

    return {
      success: true,
      fileName,
      base64Data,
    };
  } catch (error: any) {
    throw new Error(error?.message || "Gagal membuat backup database");
  }
}

export async function restoreDatabaseBackup(formData: FormData) {
  await verifyPlantManager();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("File backup tidak ditemukan atau kosong");
  }

  if (!file.name.endsWith(".json")) {
    throw new Error("Format file tidak valid. Harap upload file .json backup database");
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!parsed.data || typeof parsed.data !== "object") {
      throw new Error("Struktur file backup JSON tidak valid");
    }

    const { data } = parsed;

    // Temporarily disable foreign keys during restore
    await pool.query("SET FOREIGN_KEY_CHECKS = 0;");

    try {
      // Truncate tables
      await db.delete(schema.notifications);
      await db.delete(schema.stockMovements);
      await db.delete(schema.requestItems);
      await db.delete(schema.requests);
      await db.delete(schema.items);
      await db.delete(schema.verifications);
      await db.delete(schema.accounts);
      await db.delete(schema.sessions);
      await db.delete(schema.users);

      // Restore users
      if (Array.isArray(data.users) && data.users.length > 0) {
        await db.insert(schema.users).values(
          data.users.map((u: any) => ({
            ...u,
            createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
            updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
          }))
        );
      }

      // Restore sessions
      if (Array.isArray(data.sessions) && data.sessions.length > 0) {
        await db.insert(schema.sessions).values(
          data.sessions.map((s: any) => ({
            ...s,
            expiresAt: new Date(s.expiresAt),
            createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
            updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
          }))
        );
      }

      // Restore accounts
      if (Array.isArray(data.accounts) && data.accounts.length > 0) {
        await db.insert(schema.accounts).values(
          data.accounts.map((a: any) => ({
            ...a,
            accessTokenExpiresAt: a.accessTokenExpiresAt ? new Date(a.accessTokenExpiresAt) : null,
            refreshTokenExpiresAt: a.refreshTokenExpiresAt ? new Date(a.refreshTokenExpiresAt) : null,
            createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
            updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date(),
          }))
        );
      }

      // Restore verifications
      if (Array.isArray(data.verifications) && data.verifications.length > 0) {
        await db.insert(schema.verifications).values(
          data.verifications.map((v: any) => ({
            ...v,
            expiresAt: new Date(v.expiresAt),
            createdAt: v.createdAt ? new Date(v.createdAt) : null,
            updatedAt: v.updatedAt ? new Date(v.updatedAt) : null,
          }))
        );
      }

      // Restore items
      if (Array.isArray(data.items) && data.items.length > 0) {
        await db.insert(schema.items).values(
          data.items.map((i: any) => ({
            ...i,
            createdAt: i.createdAt ? new Date(i.createdAt) : new Date(),
          }))
        );
      }

      // Restore requests
      if (Array.isArray(data.requests) && data.requests.length > 0) {
        await db.insert(schema.requests).values(
          data.requests.map((r: any) => ({
            ...r,
            reviewedAt: r.reviewedAt ? new Date(r.reviewedAt) : null,
            handedOverAt: r.handedOverAt ? new Date(r.handedOverAt) : null,
            createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          }))
        );
      }

      // Restore requestItems
      if (Array.isArray(data.requestItems) && data.requestItems.length > 0) {
        await db.insert(schema.requestItems).values(data.requestItems);
      }

      // Restore stockMovements
      if (Array.isArray(data.stockMovements) && data.stockMovements.length > 0) {
        await db.insert(schema.stockMovements).values(
          data.stockMovements.map((sm: any) => ({
            ...sm,
            createdAt: sm.createdAt ? new Date(sm.createdAt) : new Date(),
          }))
        );
      }

      // Restore notifications
      if (Array.isArray(data.notifications) && data.notifications.length > 0) {
        await db.insert(schema.notifications).values(
          data.notifications.map((n: any) => ({
            ...n,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
          }))
        );
      }
    } finally {
      // Re-enable foreign key checks
      await pool.query("SET FOREIGN_KEY_CHECKS = 1;");
    }

    revalidatePath("/dashboard");
    revalidatePath("/stok");
    revalidatePath("/karyawan");
    revalidatePath("/riwayat-permintaan");
    revalidatePath("/backup-restore");

    return {
      success: true,
      message: "Database MariaDB berhasil dipulihkan (restore)!",
    };
  } catch (error: any) {
    throw new Error(error?.message || "Gagal memulihkan database");
  }
}

