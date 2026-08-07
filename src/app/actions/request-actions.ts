"use server";

import { db } from "@/db";
import {
  requests,
  requestItems,
  items,
  notifications,
  stockMovements,
  users,
} from "@/db/schema";
import { eq, desc, sql, or } from "drizzle-orm";
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

export async function createRequest(
  itemsList: { itemId: number; quantity: number; note?: string }[],
  purpose: string
) {
  const session = await getSession();

  const newRequest = db
    .insert(requests)
    .values({
      requesterId: session.user.id,
      status: "menunggu",
      purpose,
      createdAt: new Date(),
    })
    .returning()
    .get();

  for (const item of itemsList) {
    db.insert(requestItems)
      .values({
        requestId: newRequest.id,
        itemId: item.itemId,
        quantity: item.quantity,
        note: item.note || null,
      })
      .run();
  }

  // Notify supervisors and plant managers
  const approvers = db
    .select()
    .from(users)
    .where(
      or(eq(users.role, "supervisor"), eq(users.role, "plant_manager"))
    )
    .all();

  for (const approver of approvers) {
    db.insert(notifications)
      .values({
        userId: approver.id,
        message: `Permintaan baru dari ${session.user.name}: ${purpose}`,
        requestId: newRequest.id,
        createdAt: new Date(),
      })
      .run();
  }

  revalidatePath("/antrean-permintaan");
  revalidatePath("/riwayat-permintaan");
  revalidatePath("/notifikasi");

  return { success: true, requestId: newRequest.id };
}

export async function approveRequest(requestId: number, reason?: string) {
  const session = await getSession();
  if (
    session.user.role !== "supervisor" &&
    session.user.role !== "plant_manager"
  ) {
    throw new Error("Tidak memiliki izin");
  }

  const request = db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId))
    .get();

  if (!request) throw new Error("Permintaan tidak ditemukan");
  if (request.status !== "menunggu")
    throw new Error("Permintaan sudah diproses");

  db.update(requests)
    .set({
      status: "disetujui",
      reason: reason || null,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    })
    .where(eq(requests.id, requestId))
    .run();

  // Notify requester & handover teams (GA / Purchasing)
  db.insert(notifications)
    .values({
      userId: request.requesterId,
      message: `Permintaan Anda telah disetujui oleh ${session.user.name}${reason ? `: ${reason}` : ""}`,
      requestId: requestId,
      createdAt: new Date(),
    })
    .run();

  const handoverTeams = db
    .select()
    .from(users)
    .where(
      or(
        eq(users.role, "ga"),
        eq(users.role, "purchasing"),
        eq(users.role, "plant_manager")
      )
    )
    .all();

  for (const teamMember of handoverTeams) {
    db.insert(notifications)
      .values({
        userId: teamMember.id,
        message: `Permintaan #${requestId} telah disetujui supervisor dan siap diserahkan`,
        requestId: requestId,
        createdAt: new Date(),
      })
      .run();
  }

  revalidatePath("/antrean-permintaan");
  revalidatePath("/penyerahan-barang");
  revalidatePath("/riwayat-permintaan");
  revalidatePath(`/riwayat-permintaan/${requestId}`);
  revalidatePath("/notifikasi");

  return { success: true };
}

export async function handoverRequest(requestId: number, note?: string) {
  const session = await getSession();
  const allowedRoles = ["ga", "purchasing", "plant_manager", "supervisor"];
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    throw new Error("Tidak memiliki izin untuk menyerahkan barang");
  }

  const request = (await db.query.requests.findFirst({
    where: eq(requests.id, requestId),
    with: {
      requestItems: {
        with: {
          item: true,
        },
      },
    },
  })) as any;

  if (!request) throw new Error("Permintaan tidak ditemukan");
  if (request.status !== "disetujui") {
    throw new Error("Permintaan belum disetujui atasan atau sudah diserahkan");
  }

  const now = new Date();

  // Update status to diserahkan
  db.update(requests)
    .set({
      status: "diserahkan",
      handedOverBy: session.user.id,
      handedOverAt: now,
      handoverNote: note || null,
    })
    .where(eq(requests.id, requestId))
    .run();

  // Record stock movement (keluar) and deduct stock
  for (const ri of request.requestItems) {
    db.insert(stockMovements)
      .values({
        itemId: ri.itemId,
        type: "keluar",
        quantity: ri.quantity,
        requestId: requestId,
        note: `Penyerahan barang produksi #${requestId}${note ? ` (${note})` : ""}`,
        createdBy: session.user.id,
        createdAt: now,
      })
      .run();

    db.update(items)
      .set({
        stock: sql`${items.stock} - ${ri.quantity}`,
      })
      .where(eq(items.id, ri.itemId))
      .run();
  }

  // Notify requester
  const roleLabel =
    session.user.role === "ga"
      ? "Tim GA"
      : session.user.role === "purchasing"
      ? "Purchasing"
      : "Petugas";

  db.insert(notifications)
    .values({
      userId: request.requesterId,
      message: `Barang permintaan #${requestId} telah diserahkan oleh ${session.user.name} (${roleLabel})`,
      requestId: requestId,
      createdAt: now,
    })
    .run();

  revalidatePath("/penyerahan-barang");
  revalidatePath("/antrean-permintaan");
  revalidatePath("/riwayat-permintaan");
  revalidatePath(`/riwayat-permintaan/${requestId}`);
  revalidatePath("/stok");
  revalidatePath("/kartu-stok");
  revalidatePath("/notifikasi");

  return { success: true };
}

export async function rejectRequest(requestId: number, reason: string) {
  const session = await getSession();
  if (
    session.user.role !== "supervisor" &&
    session.user.role !== "plant_manager"
  ) {
    throw new Error("Tidak memiliki izin");
  }

  const request = db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId))
    .get();

  if (!request) throw new Error("Permintaan tidak ditemukan");
  if (request.status !== "menunggu")
    throw new Error("Permintaan sudah diproses");

  db.update(requests)
    .set({
      status: "ditolak",
      reason,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    })
    .where(eq(requests.id, requestId))
    .run();

  // Notify requester
  db.insert(notifications)
    .values({
      userId: request.requesterId,
      message: `Permintaan Anda ditolak oleh ${session.user.name}: ${reason}`,
      requestId: requestId,
      createdAt: new Date(),
    })
    .run();

  revalidatePath("/antrean-permintaan");
  revalidatePath("/riwayat-permintaan");
  revalidatePath(`/riwayat-permintaan/${requestId}`);
  revalidatePath("/notifikasi");

  return { success: true };
}

export async function getRequests(filters?: {
  status?: string;
  search?: string;
  myOnly?: boolean;
}) {
  const session = await getSession();

  const allRequests = (await db.query.requests.findMany({
    with: {
      requester: true,
      reviewer: true,
      handedOverByUser: true,
      requestItems: {
        with: {
          item: true,
        },
      },
    },
    orderBy: [desc(requests.createdAt)],
  })) as any[];

  let filtered = allRequests;

  if (filters?.myOnly) {
    filtered = filtered.filter((r: any) => r.requesterId === session.user.id);
  }

  if (filters?.status) {
    filtered = filtered.filter((r: any) => r.status === filters.status);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (r: any) =>
        r.requester.name.toLowerCase().includes(search) ||
        r.purpose?.toLowerCase().includes(search) ||
        r.requestItems.some((ri: any) =>
          ri.item.name.toLowerCase().includes(search)
        )
    );
  }

  return filtered;
}

export async function getRequestById(requestId: number) {
  const request = await db.query.requests.findFirst({
    where: eq(requests.id, requestId),
    with: {
      requester: true,
      reviewer: true,
      handedOverByUser: true,
      requestItems: {
        with: {
          item: true,
        },
      },
    },
  });

  return request as any;
}

export async function getPendingRequestsCount() {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(eq(requests.status, "menunggu"))
    .get();

  return result?.count ?? 0;
}

export async function getApprovedRequestsCount() {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(eq(requests.status, "disetujui"))
    .get();

  return result?.count ?? 0;
}
