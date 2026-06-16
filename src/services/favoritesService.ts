import { db } from "@/lib/firebaseAdmin";
import type { Favorite } from "@/types/global";

export async function getFavorites(userId: string): Promise<Favorite[]> {
  const snap = await db.collection("favorites").where("userId", "==", userId).get();
  return snap.docs.map((d) => d.data() as Favorite);
}

export async function addFavorite(userId: string, productId: string): Promise<Favorite> {
  const existing = await db
    .collection("favorites")
    .where("userId", "==", userId)
    .where("productId", "==", productId)
    .limit(1)
    .get();
  if (!existing.empty) return existing.docs[0].data() as Favorite;

  const ref = db.collection("favorites").doc();
  const fav: Favorite = { id: ref.id, userId, productId, createdAt: new Date().toISOString() };
  await ref.set(fav);
  return fav;
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  const snap = await db
    .collection("favorites")
    .where("userId", "==", userId)
    .where("productId", "==", productId)
    .limit(1)
    .get();
  if (!snap.empty) await snap.docs[0].ref.delete();
}
