"use server";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
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

export async function getNotifications() {
  const session = await getSession();

  const userNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    with: {
      request: true,
    },
    orderBy: [desc(notifications.createdAt)],
  });

  return userNotifications;
}

export async function markAsRead(notificationId: number) {
  const session = await getSession();

  db.update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.user.id)
      )
    )
    .run();

  revalidatePath("/notifikasi");

  return { success: true };
}

export async function markAllAsRead() {
  const session = await getSession();

  db.update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false)
      )
    )
    .run();

  revalidatePath("/notifikasi");

  return { success: true };
}

export async function getUnreadCount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return 0;

  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false)
      )
    )
    .get();

  return result?.count ?? 0;
}
