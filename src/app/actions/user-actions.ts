"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc, like, or } from "drizzle-orm";
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
        u.email.toLowerCase().includes(s) ||
        u.role.toLowerCase().includes(s)
    );
  }

  return allUsers;
}

export async function addEmployee(data: {
  name: string;
  email: string;
  password: string;
  role: "leader" | "supervisor" | "plant_manager";
}) {
  const session = await getSession();
  const currentRole = session.user.role;
  if (currentRole !== "supervisor" && currentRole !== "plant_manager") {
    throw new Error("Tidak memiliki hak akses");
  }

  try {
    const res = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        isActive: true,
      },
    });

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

  const targetUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!targetUser) throw new Error("Karyawan tidak ditemukan");

  const newStatus = !targetUser.isActive;

  await db
    .update(users)
    .set({
      isActive: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .run();

  revalidatePath("/karyawan");

  return { success: true, isActive: newStatus };
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await getSession();

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
