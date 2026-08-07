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

  const userNotifications = (await db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    with: {
      request: true,
    },
    orderBy: [desc(notifications.createdAt)],
  })) as any[];

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

  const role = (session.user as any)?.role;

  const userNotifications = (await db.query.notifications.findMany({
    where: and(
      eq(notifications.userId, session.user.id),
      eq(notifications.isRead, false)
    ),
    with: {
      request: true,
    },
  })) as any[];

  if (role === "ga" || role === "purchasing") {
    return userNotifications.filter(
      (n: any) =>
        n.request &&
        (n.request.status === "disetujui" || n.request.status === "diserahkan")
    ).length;
  }

  return userNotifications.length;
}
