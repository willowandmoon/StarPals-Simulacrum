import { NextResponse } from "next/server";
import { getAllProducts } from "@/services/productService";
import { getProductById } from "@/services/productService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const product = await getProductById(id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  }
  const products = await getAllProducts();
  return NextResponse.json(products);
}
