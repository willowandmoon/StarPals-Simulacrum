import { NextResponse } from "next/server";
import { getSalesByMonth } from "@/services/salesService";
import { sendSalesReport } from "@/lib/email";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  // Acepta: llamada manual con Bearer token O llamada de Vercel Cron (header propio)
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const isManual = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Obtener ventas del mes
  let sales;
  try {
    const now = new Date();
    sales = await getSalesByMonth(now.getFullYear(), now.getMonth() + 1);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Firestore query failed", detail: msg }, { status: 500 });
  }

  // 2. Calcular resumen
  const now = new Date();
  const itemMap = new Map<string, { productName: string; productImage: string; quantity: number; amount: number }>();
  let total = 0;

  for (const sale of sales) {
    total += sale.total;
    for (const item of sale.items) {
      const existing = itemMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.amount += item.price * item.quantity;
      } else {
        itemMap.set(item.productId, {
          productName: item.productName,
          productImage: item.productImage ?? "",
          quantity: item.quantity,
          amount: item.price * item.quantity,
        });
      }
    }
  }

  const month = now.toLocaleString("es", { month: "long", year: "numeric" });
  const reportData = {
    count: sales.length,
    total,
    month,
    items: Array.from(itemMap.values()),
  };

  // 3. Enviar email
  let emailError: string | null = null;
  try {
    await sendSalesReport(reportData);
  } catch (err) {
    emailError = err instanceof Error ? err.message : String(err);
    console.error("[cron] Email failed:", emailError);
  }

  return NextResponse.json({
    ok: emailError === null,
    salesCount: reportData.count,
    total: reportData.total,
    month: reportData.month,
    topProducts: reportData.items,
    emailError,
    debug: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      VERCEL_URL: process.env.VERCEL_URL || null,
    }
  });
}
