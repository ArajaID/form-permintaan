"use server";

import { db } from "@/db";
import { notifications, requests } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
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

  const rawNotifications = await db
    .select({
      notification: notifications,
      request: requests,
    })
    .from(notifications)
    .leftJoin(requests, eq(notifications.requestId, requests.id))
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt));

  const userNotifications = rawNotifications.map((row) => ({
    ...row.notification,
    request: row.request,
  }));

  // For GA and Purchasing, only show notifications for requests approved by supervisor
  if (session.user.role === "ga" || session.user.role === "purchasing") {
    return userNotifications.filter(
      (n: any) =>
        n.request &&
        (n.request.status === "disetujui" || n.request.status === "diserahkan")
    );
  }

  return userNotifications;
}

export async function markAsRead(notificationId: number) {
  const session = await getSession();

  await db.update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.user.id)
      )
    );

  revalidatePath("/notifikasi");

  return { success: true };
}

export async function markAllAsRead() {
  const session = await getSession();

  await db.update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false)
      )
    );

  revalidatePath("/notifikasi");

  return { success: true };
}

export async function getUnreadCount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return 0;

  const role = (session.user as any)?.role;

  const rawNotifications = await db
    .select({
      notification: notifications,
      request: requests,
    })
    .from(notifications)
    .leftJoin(requests, eq(notifications.requestId, requests.id))
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false)
      )
    );

  const userNotifications = rawNotifications.map((row) => ({
    ...row.notification,
    request: row.request,
  }));

  if (role === "ga" || role === "purchasing") {
    return userNotifications.filter(
      (n: any) =>
        n.request &&
        (n.request.status === "disetujui" || n.request.status === "diserahkan")
    ).length;
  }

  return userNotifications.length;
}

