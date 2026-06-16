import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getFavorites, addFavorite, removeFavorite } from "@/services/favoritesService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const favs = await getFavorites(session.user.id);
  return NextResponse.json(favs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = await req.json();
  const fav = await addFavorite(session.user.id, productId);
  return NextResponse.json(fav);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  await removeFavorite(session.user.id, productId);
  return NextResponse.json({ ok: true });
}
