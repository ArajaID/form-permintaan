"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getEmployees(search?: string) {
  const session = await getSession();
  
  // Only supervisor and plant manager can access user management
  const role = session.user.role;
  if (role !== "supervisor" && role !== "plant_manager") {
    throw new Error("Tidak memiliki hak akses");
  }

  let allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  if (search) {
    const s = search.toLowerCase();
    allUsers = allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        (u.nik && u.nik.toLowerCase().includes(s)) ||
        (u.email && u.email.toLowerCase().includes(s)) ||
        u.role.toLowerCase().includes(s)
    );
  }

  return allUsers;
}

export async function addEmployee(data: {
  name: string;
  nik: string;
  email?: string;
  password?: string;
  role: "leader" | "supervisor" | "plant_manager" | "ga" | "purchasing";
}) {
  const session = await getSession();
  const currentRole = session.user.role;
  if (currentRole !== "supervisor" && currentRole !== "plant_manager") {
    throw new Error("Tidak memiliki hak akses");
  }

  const cleanNik = data.nik.trim();
  if (!cleanNik) {
    throw new Error("NIK Karyawan wajib diisi");
  }

  const pwd = data.password && data.password.trim() ? data.password.trim() : cleanNik;
  const userEmail = data.email && data.email.trim() ? data.email.trim() : `${cleanNik}@unindo.co.id`;

  try {
    const res = await auth.api.signUpEmail({
      body: {
        name: data.name.trim(),
        email: userEmail,
        password: pwd,
        role: data.role,
        nik: cleanNik,
        isActive: true,
      },
    });

    if (res?.user) {
      await db
        .update(users)
        .set({
          nik: cleanNik,
          username: cleanNik,
          updatedAt: new Date(),
        })
        .where(eq(users.id, res.user.id));
    }

    revalidatePath("/karyawan");
    return { success: true, user: res.user };
  } catch (error: any) {
    throw new Error(error?.message || "Gagal menambah karyawan");
  }
}

export async function toggleEmployeeStatus(userId: string) {
  const session = await getSession();
  const currentRole = session.user.role;
  if (currentRole !== "supervisor" && currentRole !== "plant_manager") {
    throw new Error("Tidak memiliki hak akses");
  }

  // Prevent self deactivation
  if (session.user.id === userId) {
    throw new Error("Anda tidak dapat menonaktifkan akun sendiri");
  }

  const targetUserRes = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  const targetUser = targetUserRes[0];

  if (!targetUser) throw new Error("Karyawan tidak ditemukan");

  const newStatus = !targetUser.isActive;

  await db
    .update(users)
    .set({
      isActive: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  revalidatePath("/karyawan");

  return { success: true, isActive: newStatus };
}

export async function updateEmployee(
  userId: string,
  data: {
    name: string;
    nik?: string;
    role?: "leader" | "supervisor" | "plant_manager" | "ga" | "purchasing";
  }
) {
  const session = await getSession();
  const currentRole = session.user.role;
  if (currentRole !== "supervisor" && currentRole !== "plant_manager") {
    throw new Error("Tidak memiliki hak akses");
  }

  if (!data.name || !data.name.trim()) {
    throw new Error("Nama karyawan wajib diisi");
  }

  const targetUserRes = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  const targetUser = targetUserRes[0];

  if (!targetUser) throw new Error("Karyawan tidak ditemukan");

  const updateData: {
    name: string;
    nik?: string;
    username?: string;
    role?: "leader" | "supervisor" | "plant_manager" | "ga" | "purchasing";
    updatedAt: Date;
  } = {
    name: data.name.trim(),
    updatedAt: new Date(),
  };

  if (data.nik && data.nik.trim()) {
    updateData.nik = data.nik.trim();
    updateData.username = data.nik.trim();
  }

  if (data.role) {
    updateData.role = data.role;
  }

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId));

  revalidatePath("/karyawan");

  return { success: true };
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  await getSession();

  if (!data.currentPassword || !data.newPassword) {
    throw new Error("Password lama dan password baru wajib diisi");
  }

  if (data.newPassword.length < 6) {
    throw new Error("Password baru minimal 6 karakter");
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    });

    return { success: true };
  } catch (error: any) {
    throw new Error(error?.message || "Password lama salah atau tidak sesuai");
  }
}
