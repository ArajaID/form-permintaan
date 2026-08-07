"use server";

import { db } from "@/db";
import { items, stockMovements, users, requests } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
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

export async function getItems(search?: string, includeInactive: boolean = false) {
  let allItems = await db.select().from(items).orderBy(items.name);

  if (!includeInactive) {
    allItems = allItems.filter((item) => item.isActive);
  }

  if (search) {
    const s = search.toLowerCase();
    allItems = allItems.filter((item) =>
      item.name.toLowerCase().includes(s)
    );
  }

  return allItems;
}

export async function addStockIn(
  itemId: number,
  quantity: number,
  note?: string
) {
  const session = await getSession();

  // Create stock movement
  await db.insert(stockMovements)
    .values({
      itemId,
      type: "masuk",
      quantity,
      createdBy: session.user.id,
      note: note || null,
      createdAt: new Date(),
    });

  // Update item stock
  await db.update(items)
    .set({
      stock: sql`${items.stock} + ${quantity}`,
    })
    .where(eq(items.id, itemId));

  revalidatePath("/stok");
  revalidatePath("/stok-masuk");
  revalidatePath("/buat-permintaan");

  return { success: true };
}

export async function addStockOut(
  itemId: number,
  quantity: number,
  requestId?: number,
  note?: string
) {
  const session = await getSession();

  // Check stock availability
  const itemRes = await db.select().from(items).where(eq(items.id, itemId));
  const item = itemRes[0];
  if (!item) throw new Error("Barang tidak ditemukan");
  if (item.stock < quantity) throw new Error("Stok tidak mencukupi");

  // Create stock movement
  await db.insert(stockMovements)
    .values({
      itemId,
      type: "keluar",
      quantity,
      requestId: requestId || null,
      createdBy: session.user.id,
      note: note || null,
      createdAt: new Date(),
    });

  // Update item stock
  await db.update(items)
    .set({
      stock: sql`${items.stock} - ${quantity}`,
    })
    .where(eq(items.id, itemId));

  revalidatePath("/stok");
  revalidatePath("/stok-keluar");
  revalidatePath("/buat-permintaan");

  return { success: true };
}

export async function getStockMovements(
  type?: "masuk" | "keluar",
  search?: string
) {
  const rawMovements = await db
    .select({
      movement: stockMovements,
      item: items,
      createdByUser: users,
      request: requests,
    })
    .from(stockMovements)
    .innerJoin(items, eq(stockMovements.itemId, items.id))
    .innerJoin(users, eq(stockMovements.createdBy, users.id))
    .leftJoin(requests, eq(stockMovements.requestId, requests.id))
    .orderBy(desc(stockMovements.createdAt));

  const movements = rawMovements.map((row) => ({
    ...row.movement,
    item: row.item,
    createdByUser: row.createdByUser,
    request: row.request,
  }));

  let filtered = movements;

  if (type) {
    filtered = filtered.filter((m: any) => m.type === type);
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (m: any) =>
        m.item.name.toLowerCase().includes(s) ||
        m.createdByUser.name.toLowerCase().includes(s)
    );
  }

  return filtered;
}

export async function createItem(name: string, unit: string) {
  const session = await getSession();
  const role = (session.user as any).role;
  if (role !== "supervisor" && role !== "plant_manager") {
    throw new Error("Hanya Supervisor dan Plant Manager yang dapat menambah barang");
  }

  const existingRes = await db.select().from(items).where(eq(items.name, name.trim()));
  const existing = existingRes[0];
  if (existing) {
    throw new Error("Barang dengan nama tersebut sudah ada");
  }

  const insertRes = await db
    .insert(items)
    .values({
      name: name.trim(),
      unit: unit.trim(),
      stock: 0,
      isActive: true,
      createdAt: new Date(),
    });

  const insertedId = (insertRes as any)[0]?.insertId ?? (insertRes as any).insertId;
  const newItemRes = await db.select().from(items).where(eq(items.id, Number(insertedId)));
  const newItem = newItemRes[0];

  revalidatePath("/stok");
  revalidatePath("/buat-permintaan");

  return newItem;
}

export async function updateItem(id: number, name: string, unit: string) {
  const session = await getSession();
  const role = (session.user as any).role;
  if (role !== "supervisor" && role !== "plant_manager") {
    throw new Error("Hanya Supervisor dan Plant Manager yang dapat mengedit barang");
  }

  await db.update(items)
    .set({
      name: name.trim(),
      unit: unit.trim(),
    })
    .where(eq(items.id, id));

  revalidatePath("/stok");
  revalidatePath("/buat-permintaan");

  return { success: true };
}

export async function toggleItemStatus(id: number) {
  const session = await getSession();
  const role = (session.user as any).role;
  if (role !== "supervisor" && role !== "plant_manager") {
    throw new Error("Hanya Supervisor dan Plant Manager yang dapat mengubah status barang");
  }

  const itemRes = await db.select().from(items).where(eq(items.id, id));
  const item = itemRes[0];
  if (!item) throw new Error("Barang tidak ditemukan");

  const newStatus = !item.isActive;

  await db.update(items)
    .set({
      isActive: newStatus,
    })
    .where(eq(items.id, id));

  revalidatePath("/stok");
  revalidatePath("/buat-permintaan");

  return { success: true, isActive: newStatus };
}

export async function getItemStockCard(
  itemId: number,
  startDate?: string,
  endDate?: string
) {
  const itemRes = await db.select().from(items).where(eq(items.id, itemId));
  const item = itemRes[0];
  if (!item) throw new Error("Barang tidak ditemukan");

  const rawMovements = await db
    .select({
      movement: stockMovements,
      createdByUser: users,
      request: requests,
    })
    .from(stockMovements)
    .innerJoin(users, eq(stockMovements.createdBy, users.id))
    .leftJoin(requests, eq(stockMovements.requestId, requests.id))
    .where(eq(stockMovements.itemId, itemId))
    .orderBy(stockMovements.createdAt);

  const allMovements = rawMovements.map((row) => ({
    ...row.movement,
    createdByUser: row.createdByUser,
    request: row.request,
  }));


  let openingBalance = 0;
  let periodMovements = allMovements;

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate + "T23:59:59") : null;

  if (start) {
    // Movements before start date count towards opening balance
    const priorMovements = allMovements.filter(
      (m) => new Date(m.createdAt) < start
    );
    openingBalance = priorMovements.reduce((acc, m) => {
      return m.type === "masuk" ? acc + m.quantity : acc - m.quantity;
    }, 0);

    periodMovements = periodMovements.filter(
      (m) => new Date(m.createdAt) >= start
    );
  }

  if (end) {
    periodMovements = periodMovements.filter(
      (m) => new Date(m.createdAt) <= end
    );
  }

  let currentBalance = openingBalance;
  let totalIn = 0;
  let totalOut = 0;

  const ledger = periodMovements.map((m) => {
    if (m.type === "masuk") {
      currentBalance += m.quantity;
      totalIn += m.quantity;
    } else {
      currentBalance -= m.quantity;
      totalOut += m.quantity;
    }
    return {
      id: m.id,
      date: m.createdAt,
      type: m.type,
      quantity: m.quantity,
      user: m.createdByUser.name,
      note: m.note || (m.requestId ? `Permintaan #${m.requestId}` : "-"),
      balance: currentBalance,
    };
  });

  return {
    item,
    openingBalance,
    closingBalance: currentBalance,
    totalIn,
    totalOut,
    ledger,
  };
}

