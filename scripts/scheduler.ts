import cron from "node-cron";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const CRON_SECRET = process.env.CRON_SECRET;
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

async function runDailyReport() {
  console.log(`[scheduler] ${new Date().toLocaleString("es")} — Ejecutando reporte diario...`);
  try {
    const res = await fetch(`${BASE_URL}/api/cron/daily-report`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    const data = await res.json();
    if (data.ok) {
      console.log(`[scheduler] ✅ Reporte enviado — ${data.salesCount} ventas | $${data.total?.toFixed(2)}`);
    } else {
      console.error(`[scheduler] ⚠️  Reporte generado pero email falló: ${data.emailError}`);
      console.log(`[scheduler] Datos: ${data.salesCount} ventas | $${data.total?.toFixed(2)}`);
    }
  } catch (err) {
    console.error("[scheduler] ❌ Error al llamar el endpoint:", err);
  }
}

// Ejecutar todos los días a las 6:00 PM (hora local)
cron.schedule("0 18 * * *", runDailyReport, {
  timezone: "America/Bogota",
});

console.log("⏰ Scheduler iniciado — reporte diario programado para las 6:00 PM (Bogotá)");
console.log(`   Endpoint: ${BASE_URL}/api/cron/daily-report`);

// Ejecutar inmediatamente al iniciar para verificar que funciona
runDailyReport();
