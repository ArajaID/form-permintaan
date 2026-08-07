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
import { eq, desc, sql, or, inArray } from "drizzle-orm";
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

async function fetchFullRequests(whereClause?: any) {
  const reqList = await db.select().from(requests).where(whereClause).orderBy(desc(requests.createdAt));
  if (reqList.length === 0) return [];

  const reqIds = reqList.map((r) => r.id);
  const userIds = Array.from(
    new Set(
      reqList
        .flatMap((r) => [r.requesterId, r.reviewedBy, r.handedOverBy])
        .filter((id): id is string => Boolean(id))
    )
  );

  const userList = userIds.length > 0
    ? await db.select().from(users).where(inArray(users.id, userIds))
    : [];
  const userMap = new Map(userList.map((u) => [u.id, u]));

  const rawReqItems = await db
    .select({
      reqItem: requestItems,
      item: items,
    })
    .from(requestItems)
    .innerJoin(items, eq(requestItems.itemId, items.id))
    .where(inArray(requestItems.requestId, reqIds));

  const itemsMap = new Map<number, any[]>();
  for (const row of rawReqItems) {
    const list = itemsMap.get(row.reqItem.requestId) || [];
    list.push({
      ...row.reqItem,
      item: row.item,
    });
    itemsMap.set(row.reqItem.requestId, list);
  }

  return reqList.map((r) => ({
    ...r,
    requester: userMap.get(r.requesterId) || {
      id: r.requesterId,
      name: "Pengguna " + r.requesterId,
      email: "-",
      emailVerified: false,
      image: null,
      role: "leader" as const,
      isActive: true,
      createdAt: r.createdAt,
      updatedAt: r.createdAt,
    },
    reviewer: r.reviewedBy ? userMap.get(r.reviewedBy) || null : null,
    handedOverByUser: r.handedOverBy ? userMap.get(r.handedOverBy) || null : null,
    requestItems: itemsMap.get(r.id) || [],
  }));
}

export async function createRequest(
  itemsList: { itemId: number; quantity: number; note?: string }[],
  purpose: string
) {
  const session = await getSession();

  const reqResult = await db
    .insert(requests)
    .values({
      requesterId: session.user.id,
      status: "menunggu",
      purpose,
      createdAt: new Date(),
    });

  const newRequestId = Number((reqResult as any)[0]?.insertId ?? (reqResult as any).insertId);

  for (const item of itemsList) {
    await db.insert(requestItems)
      .values({
        requestId: newRequestId,
        itemId: item.itemId,
        quantity: item.quantity,
        note: item.note || null,
      });
  }

  // Notify supervisors and plant managers
  const approvers = await db
    .select()
    .from(users)
    .where(
      or(eq(users.role, "supervisor"), eq(users.role, "plant_manager"))
    );

  for (const approver of approvers) {
    await db.insert(notifications)
      .values({
        userId: approver.id,
        message: `Permintaan baru dari ${session.user.name}: ${purpose}`,
        requestId: newRequestId,
        createdAt: new Date(),
      });
  }

  revalidatePath("/antrean-permintaan");
  revalidatePath("/riwayat-permintaan");
  revalidatePath("/notifikasi");

  return { success: true, requestId: newRequestId };
}

export async function approveRequest(requestId: number, reason?: string) {
  const session = await getSession();
  if (
    session.user.role !== "supervisor" &&
    session.user.role !== "plant_manager"
  ) {
    throw new Error("Tidak memiliki izin");
  }

  const requestRes = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId));
  const request = requestRes[0];

  if (!request) throw new Error("Permintaan tidak ditemukan");
  if (request.status !== "menunggu")
    throw new Error("Permintaan sudah diproses");

  await db.update(requests)
    .set({
      status: "disetujui",
      reason: reason || null,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    })
    .where(eq(requests.id, requestId));

  // Notify requester & handover teams (GA / Purchasing)
  await db.insert(notifications)
    .values({
      userId: request.requesterId,
      message: `Permintaan Anda telah disetujui oleh ${session.user.name}${reason ? `: ${reason}` : ""}`,
      requestId: requestId,
      createdAt: new Date(),
    });

  const handoverTeams = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.role, "ga"),
        eq(users.role, "purchasing"),
        eq(users.role, "plant_manager")
      )
    );

  for (const teamMember of handoverTeams) {
    await db.insert(notifications)
      .values({
        userId: teamMember.id,
        message: `Permintaan #${requestId} telah disetujui supervisor dan siap diserahkan`,
        requestId: requestId,
        createdAt: new Date(),
      });
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

  const fullList = await fetchFullRequests(eq(requests.id, requestId));
  const request = fullList[0];

  if (!request) throw new Error("Permintaan tidak ditemukan");
  if (request.status !== "disetujui") {
    throw new Error("Permintaan belum disetujui atasan atau sudah diserahkan");
  }

  const now = new Date();

  // Update status to diserahkan
  await db.update(requests)
    .set({
      status: "diserahkan",
      handedOverBy: session.user.id,
      handedOverAt: now,
      handoverNote: note || null,
    })
    .where(eq(requests.id, requestId));

  // Record stock movement (keluar) and deduct stock
  for (const ri of request.requestItems) {
    await db.insert(stockMovements)
      .values({
        itemId: ri.itemId,
        type: "keluar",
        quantity: ri.quantity,
        requestId: requestId,
        note: `Penyerahan barang produksi #${requestId}${note ? ` (${note})` : ""}`,
        createdBy: session.user.id,
        createdAt: now,
      });

    await db.update(items)
      .set({
        stock: sql`${items.stock} - ${ri.quantity}`,
      })
      .where(eq(items.id, ri.itemId));
  }

  // Notify requester
  const roleLabel =
    session.user.role === "ga"
      ? "Tim GA"
      : session.user.role === "purchasing"
      ? "Purchasing"
      : "Petugas";

  await db.insert(notifications)
    .values({
      userId: request.requesterId,
      message: `Barang permintaan #${requestId} telah diserahkan oleh ${session.user.name} (${roleLabel})`,
      requestId: requestId,
      createdAt: now,
    });

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

  const requestRes = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId));
  const request = requestRes[0];

  if (!request) throw new Error("Permintaan tidak ditemukan");
  if (request.status !== "menunggu")
    throw new Error("Permintaan sudah diproses");

  await db.update(requests)
    .set({
      status: "ditolak",
      reason,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    })
    .where(eq(requests.id, requestId));

  // Notify requester
  await db.insert(notifications)
    .values({
      userId: request.requesterId,
      message: `Permintaan Anda ditolak oleh ${session.user.name}: ${reason}`,
      requestId: requestId,
      createdAt: new Date(),
    });

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

  let condition = undefined;
  if (filters?.myOnly) {
    condition = eq(requests.requesterId, session.user.id);
  }

  const allRequests = await fetchFullRequests(condition);
  let filtered = allRequests;

  if (filters?.status) {
    filtered = filtered.filter((r: any) => r.status === filters.status);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (r: any) =>
        r.requester?.name?.toLowerCase().includes(search) ||
        r.purpose?.toLowerCase().includes(search) ||
        r.requestItems.some((ri: any) =>
          ri.item.name.toLowerCase().includes(search)
        )
    );
  }

  return filtered;
}

export async function getRequestById(requestId: number) {
  const fullList = await fetchFullRequests(eq(requests.id, requestId));
  return fullList[0] || null;
}

export async function getPendingRequestsCount() {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(eq(requests.status, "menunggu"));

  return Number(result[0]?.count ?? 0);
}

export async function getApprovedRequestsCount() {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(eq(requests.status, "disetujui"));

  return Number(result[0]?.count ?? 0);
}


