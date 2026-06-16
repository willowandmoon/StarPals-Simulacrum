# ★ StarPals — Guía de Desarrollo Paso a Paso

> Tienda de coleccionables construida con Next.js 16, Firebase Firestore, NextAuth, next-intl y MUI.
> Esta guía explica CÓMO y POR QUÉ se hizo cada parte, para que puedas replicarla sin asistencia.

---

## Tabla de contenido

1. [Stack técnico](#stack-técnico)
2. [Estructura de carpetas](#estructura-de-carpetas)
3. [Paso 1 — Configuración inicial](#paso-1--configuración-inicial)
4. [Paso 2 — Internacionalización (i18n)](#paso-2--internacionalización-i18n)
5. [Paso 3 — Base de datos: Firebase Firestore](#paso-3--base-de-datos-firebase-firestore)
6. [Paso 4 — Autenticación con NextAuth](#paso-4--autenticación-con-nextauth)
7. [Paso 5 — Capa de servicios](#paso-5--capa-de-servicios)
8. [Paso 6 — API Routes](#paso-6--api-routes)
9. [Paso 7 — Componentes UI](#paso-7--componentes-ui)
10. [Paso 8 — Páginas](#paso-8--páginas)
11. [Paso 9 — Email con Nodemailer](#paso-9--email-con-nodemailer)
12. [Paso 10 — Cron Job de reporte diario](#paso-10--cron-job-de-reporte-diario)
13. [Paso 11 — Sembrar productos en Firestore](#paso-11--sembrar-productos-en-firestore)
14. [Ejecutar el proyecto](#ejecutar-el-proyecto)
15. [Colecciones de Firestore](#colecciones-de-firestore)

---

## Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.x | Framework full-stack (App Router) |
| TypeScript | 5.x | Tipado estático |
| Firebase Admin | 14.x | Acceso a Firestore desde el servidor |
| NextAuth | 4.x | Gestión de sesiones y autenticación |
| next-intl | 4.x | Internacionalización (ES/EN/PT) |
| MUI (Material UI) | 9.x | Librería de componentes UI |
| Tailwind CSS | 4.x | Utilidades de estilo |
| Nodemailer | 7.x | Envío de emails |
| bcryptjs | 3.x | Hash de contraseñas |
| node-cron | — | Tareas programadas (referencia para Vercel Cron) |

---

## Estructura de carpetas

```
src/
├── app/
│   ├── layout.tsx              # Layout raíz (solo HTML shell)
│   ├── page.tsx                # Redirect a /es
│   ├── globals.css             # Estilos globales + variables CSS
│   ├── [locale]/               # Todas las páginas con prefijo de idioma
│   │   ├── layout.tsx          # Layout con Providers (NextIntl, MUI, Session)
│   │   ├── page.tsx            # Home — catálogo de productos
│   │   ├── login/page.tsx      # Inicio de sesión
│   │   ├── register/page.tsx   # Registro de usuario
│   │   ├── favorites/page.tsx  # Favoritos (requiere auth)
│   │   ├── cart/page.tsx       # Carrito (requiere auth)
│   │   └── products/[id]/page.tsx  # Detalle de producto
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # Handler de NextAuth
│       │   └── register/route.ts       # Registro de usuario
│       ├── products/route.ts   # GET todos / GET por id
│       ├── cart/route.ts       # GET, POST, DELETE carrito
│       ├── favorites/route.ts  # GET, POST, DELETE favoritos
│       ├── sales/route.ts      # POST venta
│       └── cron/daily-report/route.ts  # Reporte mensual
├── components/
│   ├── Providers.tsx           # SessionProvider + NextIntlClientProvider + ThemeProvider
│   ├── Navbar.tsx              # Barra de navegación con auth y selector de idioma
│   ├── ProductCard.tsx         # Tarjeta de producto con props (imagen, nombre, precio, favorito)
│   └── FavoriteButton.tsx      # Botón estrella de favoritos (toggle)
├── i18n/
│   ├── routing.ts              # defineRouting con locales y defaultLocale
│   ├── navigation.ts           # createNavigation para Link/useRouter i18n
│   ├── request.ts              # getRequestConfig (carga mensajes por locale)
│   └── messages/
│       ├── es.json             # Traducciones en español
│       ├── en.json             # Traducciones en inglés
│       └── pt.json             # Traducciones en portugués
├── lib/
│   ├── firebaseAdmin.ts        # Inicialización de Firebase Admin SDK
│   └── email.ts               # Funciones de envío de email (bienvenida + reporte)
├── services/
│   ├── userService.ts          # createUser, getUserByEmail, verifyPassword
│   ├── productService.ts       # getAllProducts, getProductById
│   ├── cartService.ts          # getCart, addToCart, removeFromCart, clearCart
│   ├── favoritesService.ts     # getFavorites, addFavorite, removeFavorite
│   └── salesService.ts        # createSale, getSalesByMonth
├── types/
│   ├── global.d.ts             # Interfaces TypeScript (User, Product, Cart, etc.)
│   └── next-auth.d.ts          # Augmentación de tipos de NextAuth (user.id)
└── middleware.ts               # next-intl middleware para routing i18n

scripts/
└── seed.ts                     # Script para poblar Firestore con productos iniciales

public/
└── characters/                 # Imágenes de los personajes (1.png – 10.png)
```

---

## Paso 1 — Configuración inicial

### 1.1 Variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```env
# NextAuth
NEXTAUTH_SECRET=un-secreto-muy-largo-y-aleatorio
NEXTAUTH_URL=http://localhost:3000

# Firebase Admin SDK (se obtienen del archivo JSON de la cuenta de servicio)
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMI....\n-----END PRIVATE KEY-----\n"

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_FROM=StarPals Shop <tu@gmail.com>
REPORT_EMAIL=tu@gmail.com

# Cron (seguridad)
CRON_SECRET=un-secreto-para-el-cron
```

> **Por qué `.env.local`?** Next.js lo carga automáticamente y no se sube a git (está en `.gitignore`). Las variables sin prefijo `NEXT_PUBLIC_` solo están disponibles en el servidor.

### 1.2 next.config.ts

```ts
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl({ images: { remotePatterns: [] } });
```

> **Por qué el plugin?** next-intl necesita interceptar el build de Next.js para funcionar correctamente con Server Components. El plugin configura eso automáticamente.

---

## Paso 2 — Internacionalización (i18n)

### 2.1 `src/i18n/routing.ts`

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en", "pt"],
  defaultLocale: "es",
});
```

> **Cómo funciona:** `defineRouting` le dice a next-intl qué idiomas soporta el proyecto. El `defaultLocale` es el que se usa si no se especifica otro.

### 2.2 `src/i18n/navigation.ts`

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

> **Por qué?** En lugar de usar `next/navigation` directamente, usamos estas versiones que automáticamente prependen el locale a las rutas (ej: `/en/cart` en lugar de `/cart`).

### 2.3 `src/i18n/request.ts`

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

> **Cómo funciona:** Se llama en cada request del servidor. Lee el locale del segmento `[locale]` de la URL y carga el archivo JSON de mensajes correspondiente.

### 2.4 `src/middleware.ts`

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(es|en|pt)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)" ],
};
```

> **Por qué el middleware?** Detecta el idioma del usuario (de la URL, cookie o header `Accept-Language`) y redirige o reescribe la URL. El `matcher` excluye las API routes y archivos estáticos.

### 2.5 Mensajes de traducción

Los archivos `es.json`, `en.json`, `pt.json` en `src/i18n/messages/` tienen estructura anidada:

```json
{
  "nav": { "home": "Inicio", "cart": "Carrito" },
  "product": { "addToCart": "Agregar al carrito" }
}
```

**Uso en Server Components:** `const t = await getTranslations("nav")`  
**Uso en Client Components:** `const t = useTranslations("nav")`  
**Con parámetros:** `t("hello", { name: "Ana" })` → `"Hola, Ana"`

---

## Paso 3 — Base de datos: Firebase Firestore

### 3.1 `src/lib/firebaseAdmin.ts`

```ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = getFirestore();
```

> **Por qué Firebase Admin?** Es el SDK para uso en el servidor (Node.js). El SDK cliente de Firebase es para el navegador. Nunca uses el SDK cliente en API routes.
>
> **Por qué `replace(/\\n/g, "\n")`?** En los archivos `.env`, los saltos de línea se escapan como `\n`. Firebase necesita los saltos de línea reales en la clave privada.
>
> **Por qué `getApps().length`?** En desarrollo, Next.js puede reinicializar el módulo varias veces. Este check evita el error "Firebase app already exists".

### 3.2 Colecciones de Firestore

| Colección | Campos principales |
|---|---|
| `users` | id, name, email, password (hash), createdAt |
| `products` | id, name, price, image, description, extendedDescription, specs, stock, category |
| `cart` | id, userId, items[], updatedAt |
| `favorites` | id, userId, productId, createdAt |
| `sales` | id, userId, items[], total, createdAt |

> **Diferencia con MongoDB:** Firestore no necesita esquemas (como Mongoose). Se usa directamente con métodos como `.collection("users").doc()`, `.set()`, `.get()`, `.where()`.

---

## Paso 4 — Autenticación con NextAuth

### 4.1 `src/app/api/auth/[...nextauth]/route.ts`

```ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword } from "@/services/userService";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;
        const valid = await verifyPassword(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) { if (user) token.id = user.id; return token; },
    async session({ session, token }) { session.user.id = token.id; return session; },
  },
});
export { handler as GET, handler as POST };
```

> **Cómo funciona:**
> 1. El usuario envía email + contraseña al frontend
> 2. `signIn("credentials", {...})` llama a esta ruta
> 3. `authorize()` busca el usuario en Firestore y verifica la contraseña
> 4. Si es válido, NextAuth crea un JWT con `session: { strategy: "jwt" }`
> 5. El callback `session` agrega `user.id` al objeto session para usarlo en el servidor

### 4.2 Augmentación de tipos

```ts
// src/types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string; email?: string; };
  }
}
```

> **Por qué?** Por defecto, `session.user` no tiene `id`. Esta declaración le dice a TypeScript que `user.id` existe.

### 4.3 Uso de la sesión

**En Server Components:**
```ts
const session = await getServerSession();
if (session?.user?.id) { /* usuario autenticado */ }
```

**En Client Components:**
```ts
const { data: session } = useSession();
if (!session) { /* redirigir a login */ }
```

---

## Paso 5 — Capa de servicios

La capa de servicios (`src/services/`) desacopla la lógica de negocio de las API routes. Cada función interactúa directamente con Firestore a través de `db` de `firebaseAdmin.ts`.

### Patrón general

```ts
// Ejemplo: productService.ts
import { db } from "@/lib/firebaseAdmin";
import type { Product } from "@/types/global";

export async function getAllProducts(): Promise<Product[]> {
  const snap = await db.collection("products").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await db.collection("products").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Product;
}
```

> **Por qué la capa de servicios?** Las API routes deben ser delgadas (solo manejan HTTP). La lógica de negocio va en servicios. Así, si cambias la base de datos, solo cambias los servicios, no las rutas.

---

## Paso 6 — API Routes

Todas las rutas están en `src/app/api/`. Siguen el patrón REST.

### Estructura de una ruta protegida

```ts
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await miServicio(session.user.id);
  return NextResponse.json(data);
}
```

| Ruta | Método | Descripción |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | Handler de NextAuth (login/logout) |
| `/api/auth/register` | POST | Crear usuario nuevo |
| `/api/products` | GET | Listar todos / obtener por `?id=` |
| `/api/cart` | GET/POST/DELETE | Ver/agregar/quitar del carrito |
| `/api/favorites` | GET/POST/DELETE | Ver/agregar/quitar favoritos |
| `/api/sales` | POST | Registrar una venta (vacía el carrito) |
| `/api/cron/daily-report` | GET | Generar y enviar reporte mensual |

---

## Paso 7 — Componentes UI

### Providers.tsx (Client Component)

Envuelve la app con tres providers que necesitan el contexto del cliente:

```tsx
"use client";
export default function Providers({ children, locale, messages }) {
  return (
    <SessionProvider>           {/* NextAuth: hace session disponible */}
      <NextIntlClientProvider locale={locale} messages={messages}>  {/* i18n */}
        <ThemeProvider theme={theme}>    {/* MUI: colores y fuentes */}
          <CssBaseline />
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
```

### ProductCard.tsx — Componente con props

```tsx
interface ProductCardProps {
  product: Product;   // objeto completo del producto
  isFavorited?: boolean;  // estado inicial del favorito
}

export default function ProductCard({ product, isFavorited = false }: ProductCardProps) {
  // Muestra: imagen, nombre, precio, chip de stock, botón de favorito
  // Al hacer click en la imagen/nombre → navega a /products/[id]
}
```

> **Por qué props?** El componente es reutilizable. La misma `ProductCard` funciona en el home y en la página de favoritos.

### FavoriteButton.tsx — Toggle de favoritos

```tsx
export default function FavoriteButton({ productId, initialFavorited }) {
  const [favorited, setFavorited] = useState(initialFavorited);

  const toggle = async () => {
    if (!session) { router.push("/login"); return; }
    if (favorited) {
      await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" });
    } else {
      await fetch("/api/favorites", { method: "POST", body: JSON.stringify({ productId }) });
    }
    setFavorited(!favorited);
  };
}
```

---

## Paso 8 — Páginas

### Layout raíz (`src/app/layout.tsx`)

Solo define el shell HTML básico. No tiene providers porque no conoce el locale.

### Layout de locale (`src/app/[locale]/layout.tsx`)

```tsx
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages(); // carga mensajes del idioma actual
  return (
    <html lang={locale}>
      <body>
        <Providers locale={locale} messages={messages}>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
```

> **Por qué dos layouts?** Next.js solo puede tener una etiqueta `<html>` por árbol de layouts. El layout raíz es el shell, el de locale agrega el contexto de idioma.

### Home (`/[locale]/page.tsx`)

- Server Component (puede usar `async/await` directamente)
- Llama `getAllProducts()` para obtener todos los productos
- Si hay sesión, también carga los favoritos del usuario para marcar las estrellas
- Renderiza la grilla de `ProductCard`

### Detalle de producto (`/[locale]/products/[id]/page.tsx`)

- Client Component (necesita estado para el snackbar y llamadas a API del carrito)
- Usa `useParams()` para leer el `id` de la URL
- Fetch del producto al montar el componente
- Botón "Agregar al carrito": si no hay sesión → muestra snackbar y redirige a login

### Carrito y Favoritos

Ambos son Client Components que:
1. Detectan el estado de autenticación con `useSession()`
2. Si `status === "unauthenticated"` → redirigen a login
3. Si `status === "authenticated"` → hacen fetch de los datos

---

## Paso 9 — Email con Nodemailer

### Configurar Gmail para envío

1. Activa la verificación en 2 pasos en tu cuenta Gmail
2. Ve a **Cuenta Google → Seguridad → Contraseñas de aplicación**
3. Genera una contraseña para "Correo" en "Dispositivo personalizado"
4. Usa esa contraseña de 16 caracteres en `EMAIL_PASS`

### Email de bienvenida

```ts
// Se llama automáticamente al registrar un usuario
await sendWelcomeEmail(user.name, user.email);
```

La función está en `src/lib/email.ts`. Usa un template HTML con los colores del diseño.

---

## Paso 10 — Cron Job de reporte diario

### Endpoint del cron

```ts
// GET /api/cron/daily-report
// Requiere header: Authorization: Bearer {CRON_SECRET}
export async function GET(req: Request) {
  // 1. Valida el secret
  // 2. Obtiene ventas del mes actual
  // 3. Agrupa por producto
  // 4. Envía reporte por email
}
```

### Configuración en Vercel

En `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-report",
      "schedule": "0 8 * * *"
    }
  ]
}
```

> Esta configuración dispara el endpoint todos los días a las 8AM UTC. Vercel Cron Jobs envía automáticamente el header de autorización.

### Para pruebas locales

```bash
curl -H "Authorization: Bearer tu-cron-secret" http://localhost:3000/api/cron/daily-report
```

---

## Paso 11 — Sembrar productos en Firestore

El script `scripts/seed.ts` crea los 10 productos (los personajes) en Firestore.

```bash
npm run seed
```

> **Importante:** Ejecuta el seed solo una vez. Si lo ejecutas de nuevo, creará duplicados. Verifica en la consola de Firebase si los productos ya existen.

---

## Ejecutar el proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.local` y completa los valores reales.

### 3. Sembrar la base de datos

```bash
npm run seed
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La ruta `/` redirige automáticamente a `/es`.

---

## Colecciones de Firestore

Debes crear estas colecciones en Firebase Console o se crean automáticamente al hacer operaciones:

### `products` (creada por el seed)
```json
{
  "id": "auto-generado",
  "name": "Galaxy Buddy",
  "price": 24.99,
  "image": "/characters/1.png",
  "description": "Descripción corta",
  "extendedDescription": "Descripción larga para la página de detalle",
  "specs": { "Material": "PVC", "Altura": "12 cm" },
  "stock": 48,
  "category": "Edicion Galactica"
}
```

### `users` (creada al registrarse)
```json
{
  "id": "auto-generado",
  "name": "Ana García",
  "email": "ana@email.com",
  "password": "$2b$10$...",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### `cart` (una por usuario)
```json
{
  "id": "auto-generado",
  "userId": "id-del-usuario",
  "items": [
    { "productId": "id-producto", "productName": "Galaxy Buddy",
      "productImage": "/characters/1.png", "price": 24.99, "quantity": 2 }
  ],
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### `favorites`
```json
{ "id": "auto-generado", "userId": "id-usuario", "productId": "id-producto", "createdAt": "..." }
```

### `sales`
```json
{
  "id": "auto-generado",
  "userId": "id-usuario",
  "items": [{ "productId": "...", "productName": "...", "price": 24.99, "quantity": 1 }],
  "total": 24.99,
  "createdAt": "2024-01-15T12:00:00.000Z"
}
```

---

## Flujo completo del sistema

```
Usuario visita /
   ↓ middleware next-intl
Redirige a /es (defaultLocale)
   ↓
[locale]/page.tsx (Server Component)
  → getAllProducts() → Firestore
  → getFavorites() → Firestore (si hay sesión)
  → renderiza ProductCard para cada producto

Usuario hace click en estrella (FavoriteButton)
  → Si no hay sesión: redirige a /es/login
  → Si hay sesión: POST /api/favorites → Firestore

Usuario agrega al carrito (página detalle)
  → Si no hay sesión: muestra snackbar + redirige a login
  → Si hay sesión: POST /api/cart → Firestore

Usuario realiza compra (CartPage)
  → POST /api/sales → crea documento en "sales"
  → clearCart() → vacía el carrito en Firestore

Cron job diario (0 8 * * *)
  → GET /api/cron/daily-report
  → getSalesByMonth() → Firestore
  → sendSalesReport() → Nodemailer → Email
```
