"use server";

import { sqlite } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";

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
    const tempBackupPath = path.join(process.cwd(), `temp-backup-${Date.now()}.db`);
    
    // Ensure WAL is checkpointed and backup to temp file safely
    sqlite.pragma("wal_checkpoint(TRUNCATE)");
    await sqlite.backup(tempBackupPath);

    const fileBuffer = fs.readFileSync(tempBackupPath);
    const base64Data = fileBuffer.toString("base64");

    // Clean up temp backup file
    if (fs.existsSync(tempBackupPath)) {
      fs.unlinkSync(tempBackupPath);
    }

    const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `database-backup-${dateStr}.db`;

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

  if (!file.name.endsWith(".db") && !file.name.endsWith(".sqlite")) {
    throw new Error("Format file tidak valid. Harap upload file .db atau .sqlite");
  }

  const tempRestorePath = path.join(process.cwd(), `temp-restore-${Date.now()}.db`);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(tempRestorePath, buffer);

    // Test database integrity
    const tempDb = new Database(tempRestorePath);
    const integrity = tempDb.pragma("integrity_check", { simple: true });
    if (integrity !== "ok") {
      tempDb.close();
      if (fs.existsSync(tempRestorePath)) fs.unlinkSync(tempRestorePath);
      throw new Error("File backup rusak atau bukan database SQLite yang valid");
    }

    // Auto-migrate schema on restored database if columns from newer updates are missing
    try {
      tempDb.exec("ALTER TABLE requests ADD COLUMN handed_over_by TEXT;");
    } catch {}
    try {
      tempDb.exec("ALTER TABLE requests ADD COLUMN handed_over_at INTEGER;");
    } catch {}
    try {
      tempDb.exec("ALTER TABLE requests ADD COLUMN handover_note TEXT;");
    } catch {}

    // Backup tempDb over main local.db
    sqlite.pragma("wal_checkpoint(TRUNCATE)");
    await tempDb.backup(path.join(process.cwd(), "local.db"));
    tempDb.close();

    // Clean up temporary files
    if (fs.existsSync(tempRestorePath)) {
      fs.unlinkSync(tempRestorePath);
    }

    const walPath = path.join(process.cwd(), "local.db-wal");
    const shmPath = path.join(process.cwd(), "local.db-shm");
    if (fs.existsSync(walPath)) try { fs.unlinkSync(walPath); } catch {}
    if (fs.existsSync(shmPath)) try { fs.unlinkSync(shmPath); } catch {}

    revalidatePath("/dashboard");
    revalidatePath("/stok");
    revalidatePath("/karyawan");
    revalidatePath("/riwayat-permintaan");
    revalidatePath("/backup-restore");

    return {
      success: true,
      message: "Database berhasil dipulihkan (restore)!",
    };
  } catch (error: any) {
    if (fs.existsSync(tempRestorePath)) {
      try { fs.unlinkSync(tempRestorePath); } catch {}
    }
    throw new Error(error?.message || "Gagal memulihkan database");
  }
}
