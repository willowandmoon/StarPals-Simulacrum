import { db } from "@/lib/firebaseAdmin";
import type { Cart, CartItem } from "@/types/global";

async function getCartRef(userId: string) {
  const snap = await db.collection("cart").where("userId", "==", userId).limit(1).get();
  if (!snap.empty) return snap.docs[0].ref;
  const ref = db.collection("cart").doc();
  await ref.set({ id: ref.id, userId, items: [], updatedAt: new Date().toISOString() });
  return ref;
}

export async function getCart(userId: string): Promise<Cart> {
  const ref = await getCartRef(userId);
  const doc = await ref.get();
  return doc.data() as Cart;
}

export async function addToCart(userId: string, item: CartItem): Promise<Cart> {
  const ref = await getCartRef(userId);
  const doc = await ref.get();
  const cart = doc.data() as Cart;
  const items = cart.items || [];
  const idx = items.findIndex((i) => i.productId === item.productId);
  if (idx >= 0) {
    items[idx].quantity += item.quantity;
  } else {
    items.push(item);
  }
  await ref.update({ items, updatedAt: new Date().toISOString() });
  return { ...cart, items };
}

export async function setItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
  const ref = await getCartRef(userId);
  const doc = await ref.get();
  const cart = doc.data() as Cart;
  const items = (cart.items || []).map((i) =>
    i.productId === productId ? { ...i, quantity } : i
  ).filter((i) => i.quantity > 0);
  await ref.update({ items, updatedAt: new Date().toISOString() });
  return { ...cart, items };
}

export async function removeFromCart(userId: string, productId: string): Promise<Cart> {
  const ref = await getCartRef(userId);
  const doc = await ref.get();
  const cart = doc.data() as Cart;
  const items = (cart.items || []).filter((i) => i.productId !== productId);
  await ref.update({ items, updatedAt: new Date().toISOString() });
  return { ...cart, items };
}

export async function clearCart(userId: string): Promise<void> {
  const ref = await getCartRef(userId);
  await ref.update({ items: [], updatedAt: new Date().toISOString() });
}
