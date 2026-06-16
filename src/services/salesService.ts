import { db } from "@/lib/firebaseAdmin";
import type { Sale, SaleItem } from "@/types/global";

export async function createSale(userId: string, items: SaleItem[], total: number): Promise<Sale> {
  const ref = db.collection("sales").doc();
  const sale: Sale = {
    id: ref.id,
    userId,
    items,
    total,
    createdAt: new Date().toISOString(),
  };
  await ref.set(sale);
  return sale;
}

export async function getSalesByUser(userId: string): Promise<Sale[]> {
  const snap = await db.collection("sales").where("userId", "==", userId).get();
  return snap.docs
    .map((d) => d.data() as Sale)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSalesByMonth(year: number, month: number): Promise<Sale[]> {
  const start = new Date(year, month - 1, 1).toISOString();
  const end = new Date(year, month, 0, 23, 59, 59).toISOString();
  const snap = await db
    .collection("sales")
    .where("createdAt", ">=", start)
    .where("createdAt", "<=", end)
    .get();
  return snap.docs.map((d) => d.data() as Sale);
}
