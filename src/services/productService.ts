import { db } from "@/lib/firebaseAdmin";
import type { Product } from "@/types/global";

export async function getAllProducts(): Promise<Product[]> {
  const snap = await db.collection("products").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await db.collection("products").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Product;
}
