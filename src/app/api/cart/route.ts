import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCart, addToCart, removeFromCart, setItemQuantity } from "@/services/cartService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cart = await getCart(session.user.id);
  return NextResponse.json(cart);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const cart = await addToCart(session.user.id, body);
  return NextResponse.json(cart);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId, quantity } = await req.json();
  if (!productId || quantity == null) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const cart = await setItemQuantity(session.user.id, productId, quantity);
  return NextResponse.json(cart);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  const cart = await removeFromCart(session.user.id, productId);
  return NextResponse.json(cart);
}
