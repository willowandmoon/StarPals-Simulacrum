import { db } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";
import type { User } from "@/types/global";

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("EMAIL_EXISTS");

  const hashed = await bcrypt.hash(password, 10);
  const ref = db.collection("users").doc();
  const user: User = {
    id: ref.id,
    name,
    email,
    password: hashed,
    createdAt: new Date().toISOString(),
  };
  await ref.set(user);
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const snap = await db.collection("users").where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data() as User;
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
