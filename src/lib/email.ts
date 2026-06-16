import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// Genera la URL pública de la imagen usando el dominio de producción
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
};

function getImgUrl(relPath: string): string {
  const base = getBaseUrl();
  const cleanPath = relPath.startsWith("/") ? relPath : `/${relPath}`;
  return `${base}${cleanPath}`;
}

// Genera un bloque <img> apuntando a la URL pública del personaje
function charImg(n: number, size = 80): string {
  const src = getImgUrl(`/characters/${n}.png`);
  return `<img src="${src}" width="${size}" height="${size}"
    style="object-fit:contain;display:inline-block;vertical-align:middle;" alt="StarPal ${n}" />`;
}

export async function sendWelcomeEmail(name: string, email: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Bienvenido a StarPals",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 16px;">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

  <!-- Header con personajes -->
  <tr><td style="background:#1B2464;border-radius:16px 16px 0 0;padding:32px 24px 0;text-align:center;">
    <div style="font-size:2rem;color:#F5C518;font-weight:900;letter-spacing:2px;margin-bottom:20px;">
      STARPALS
    </div>
    <!-- Fila de personajes decorativos -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:right;padding-right:8px;opacity:0.5;width:20%;">${charImg(3, 56)}</td>
        <td style="text-align:center;width:20%;">${charImg(7, 72)}</td>
        <td style="text-align:center;background:rgba(245,197,24,0.12);border-radius:50%;width:20%;padding:4px;">${charImg(1, 90)}</td>
        <td style="text-align:center;width:20%;">${charImg(5, 72)}</td>
        <td style="text-align:left;padding-left:8px;opacity:0.5;width:20%;">${charImg(9, 56)}</td>
      </tr>
    </table>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:36px 32px;text-align:center;">
    <h2 style="color:#1B2464;font-size:1.5rem;margin:0 0 12px;font-weight:800;">Hola, ${name}</h2>
    <p style="color:#555;font-size:0.95rem;line-height:1.7;margin:0 0 28px;">
      Tu cuenta ha sido creada exitosamente. Ahora eres parte de la familia StarPals
      y puedes explorar nuestra coleccion exclusiva de figuras de edicion limitada,
      guardar tus favoritos y realizar pedidos.
    </p>

    <!-- Grid de 3 personajes con texto -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="width:33%;padding:0 6px;text-align:center;vertical-align:top;">
          <div style="background:#F5F0E8;border-radius:12px;padding:16px 8px;">
            ${charImg(2, 56)}
            <div style="color:#1B2464;font-weight:800;font-size:0.82rem;margin-top:8px;">10 personajes</div>
            <div style="color:#888;font-size:0.75rem;">en catalogo</div>
          </div>
        </td>
        <td style="width:33%;padding:0 6px;text-align:center;vertical-align:top;">
          <div style="background:#F5F0E8;border-radius:12px;padding:16px 8px;">
            ${charImg(6, 56)}
            <div style="color:#1B2464;font-weight:800;font-size:0.82rem;margin-top:8px;">Favoritos</div>
            <div style="color:#888;font-size:0.75rem;">guarda los tuyos</div>
          </div>
        </td>
        <td style="width:33%;padding:0 6px;text-align:center;vertical-align:top;">
          <div style="background:#F5F0E8;border-radius:12px;padding:16px 8px;">
            ${charImg(8, 56)}
            <div style="color:#1B2464;font-weight:800;font-size:0.82rem;margin-top:8px;">Carrito</div>
            <div style="color:#888;font-size:0.75rem;">compra facil</div>
          </div>
        </td>
      </tr>
    </table>

    <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}"
       style="display:inline-block;background:#F5C518;color:#1B2464;padding:14px 36px;
              border-radius:50px;text-decoration:none;font-weight:900;font-size:0.95rem;letter-spacing:0.5px;">
      Explorar la coleccion
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#1B2464;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
    <p style="color:rgba(255,255,255,0.45);font-size:0.75rem;margin:0;">
      StarPals Shop · Coleccionables de edicion limitada<br>
      Si no creaste esta cuenta, puedes ignorar este correo.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
  });
}

const PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  "Galaxy Buddy": "/characters/1.png",
  "BluePaw": "/characters/2.png",
  "Cream Puff": "/characters/3.png",
  "Cloudberry": "/characters/4.png",
  "Leo Hoodie": "/characters/5.png",
  "SpaceKid": "/characters/6.png",
  "Robiton Deluxe": "/characters/7.png",
  "Heartsy Rock": "/characters/8.png",
  "MysticKat Crystal": "/characters/9.png",
  "TealBun Lucky": "/characters/10.png",
};

export async function sendSalesReport(salesData: {
  count: number;
  total: number;
  month: string;
  items: Array<{ productName: string; productImage: string; quantity: number; amount: number }>;
}) {
  const sorted = [...salesData.items].sort((a, b) => b.amount - a.amount);
  const topProduct = sorted[0];

  const itemRows = sorted.map((item, i) => {
    const medal = i === 0 ? "1°" : i === 1 ? "2°" : i === 2 ? "3°" : `${i + 1}°`;
    // Si la imagen está vacía (compras antiguas), buscamos el fallback según el nombre del producto
    const fallbackImage = PRODUCT_IMAGE_FALLBACKS[item.productName] || "/characters/1.png";
    const imgSrc = getImgUrl(item.productImage || fallbackImage);
    return `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8f9ff"};">
      <td style="padding:12px 16px;border-bottom:1px solid #eef0f8;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px;">
              <div style="width:48px;height:48px;background:#1B2464;border-radius:8px;overflow:hidden;display:inline-block;">
                <img src="${imgSrc}" width="48" height="48"
                  style="object-fit:contain;padding:4px;display:block;" alt="${item.productName}" />
              </div>
            </td>
            <td>
              <div style="color:#888;font-size:0.72rem;font-weight:700;letter-spacing:0.5px;">${medal}</div>
              <div style="color:#1B2464;font-weight:700;font-size:0.9rem;">${item.productName}</div>
            </td>
          </tr>
        </table>
      </td>
      <td style="padding:12px 16px;text-align:center;border-bottom:1px solid #eef0f8;">
        <span style="background:#1B2464;color:#F5C518;font-weight:800;font-size:0.85rem;
              padding:4px 12px;border-radius:20px;">${item.quantity}</span>
      </td>
      <td style="padding:12px 16px;text-align:right;color:#1B2464;font-weight:800;
            border-bottom:1px solid #eef0f8;font-size:0.95rem;">
        $${item.amount.toFixed(2)}
      </td>
    </tr>`;
  }).join("");

  // Personajes decorativos para el header del reporte
  const headerChars = [2, 4, 6, 8, 10];

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.REPORT_EMAIL,
    subject: `Reporte de ventas - ${salesData.month} | StarPals`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 16px;">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#1B2464;border-radius:16px 16px 0 0;padding:32px 32px 0;text-align:center;">
    <div style="font-size:1.8rem;color:#F5C518;font-weight:900;letter-spacing:2px;margin-bottom:4px;">STARPALS</div>
    <div style="color:rgba(255,255,255,0.6);font-size:0.82rem;margin-bottom:4px;">Reporte diario de ventas</div>
    <div style="display:inline-block;background:rgba(245,197,24,0.15);border:1.5px solid #F5C518;
         color:#F5C518;border-radius:50px;padding:5px 20px;font-size:0.85rem;font-weight:700;margin-bottom:24px;">
      ${salesData.month}
    </div>
    <!-- Personajes en fila -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${headerChars.map((n, i) => `
        <td style="width:20%;text-align:center;${i === 0 || i === 4 ? "opacity:0.4;" : i === 1 || i === 3 ? "opacity:0.7;" : ""}">
          ${charImg(n, i === 2 ? 80 : i === 1 || i === 3 ? 64 : 48)}
        </td>`).join("")}
      </tr>
    </table>
  </td></tr>

  <!-- KPI Cards -->
  <tr><td style="background:#232d82;padding:24px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:50%;padding-right:8px;">
          <div style="background:rgba(255,255,255,0.08);border-radius:12px;padding:20px;text-align:center;
               border:1px solid rgba(245,197,24,0.2);">
            <div style="color:rgba(255,255,255,0.55);font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;">
              Total de pedidos
            </div>
            <div style="color:#F5C518;font-size:2.8rem;font-weight:900;line-height:1;margin:8px 0;">
              ${salesData.count}
            </div>
            <div style="color:rgba(255,255,255,0.45);font-size:0.72rem;">pedidos este mes</div>
          </div>
        </td>
        <td style="width:50%;padding-left:8px;">
          <div style="background:rgba(255,255,255,0.08);border-radius:12px;padding:20px;text-align:center;
               border:1px solid rgba(245,197,24,0.2);">
            <div style="color:rgba(255,255,255,0.55);font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;">
              Ingresos totales
            </div>
            <div style="color:#F5C518;font-size:2.2rem;font-weight:900;line-height:1;margin:8px 0;">
              $${salesData.total.toFixed(2)}
            </div>
            <div style="color:rgba(255,255,255,0.45);font-size:0.72rem;">acumulado del mes</div>
          </div>
        </td>
      </tr>
    </table>
    ${topProduct ? `
    <div style="background:rgba(245,197,24,0.1);border:1.5px solid rgba(245,197,24,0.3);border-radius:10px;
         padding:10px 16px;margin-top:16px;text-align:center;color:rgba(255,255,255,0.8);font-size:0.82rem;">
      Producto mas vendido del mes:
      <strong style="color:#F5C518;">${topProduct.productName}</strong>
      — ${topProduct.quantity} unidades
    </div>` : ""}
  </td></tr>

  <!-- Tabla de productos -->
  <tr><td style="background:#ffffff;padding:32px;">
    <div style="color:#1B2464;font-weight:800;font-size:1rem;margin-bottom:16px;
         padding-bottom:12px;border-bottom:2px solid #F5F0E8;">
      Detalle por producto
    </div>
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border-radius:10px;overflow:hidden;border:1.5px solid #eef0f8;">
      <thead>
        <tr style="background:#1B2464;">
          <th style="padding:12px 16px;text-align:left;color:#F5C518;font-size:0.75rem;
               text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Producto</th>
          <th style="padding:12px 16px;text-align:center;color:#F5C518;font-size:0.75rem;
               text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Unidades</th>
          <th style="padding:12px 16px;text-align:right;color:#F5C518;font-size:0.75rem;
               text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Monto</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr style="background:#F5F0E8;">
          <td colspan="2" style="padding:14px 16px;color:#1B2464;font-weight:800;font-size:0.9rem;">
            TOTAL DEL MES
          </td>
          <td style="padding:14px 16px;text-align:right;color:#1B2464;font-weight:900;font-size:1.1rem;">
            $${salesData.total.toFixed(2)}
          </td>
        </tr>
      </tfoot>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#1B2464;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
    <p style="color:rgba(255,255,255,0.4);font-size:0.73rem;margin:0;line-height:1.6;">
      StarPals Shop · Reporte generado automaticamente<br>
      Este correo se envia todos los dias a las 6:00 PM
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
  });
}
