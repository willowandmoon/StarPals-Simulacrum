import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createSale } from "@/services/salesService";
import { clearCart } from "@/services/cartService";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { items, total } = await req.json();
  const sale = await createSale(session.user.id, items, total);
  await clearCart(session.user.id);
  return NextResponse.json(sale);
}
