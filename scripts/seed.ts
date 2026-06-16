import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

const products = [
  {
    name: "Galaxy Buddy",
    price: 24.99,
    image: "/characters/1.png",
    description: "Figura de edicion limitada con belly galactico brillante",
    extendedDescription: "Galaxy Buddy es el mas misterioso de los StarPals. Con su belly lleno de estrellas y su sonrisa inquieta, este coleccionable viene pintado a mano con pigmentos que brillan bajo luz UV. Edicion de solo 500 unidades mundiales.",
    specs: { Material: "PVC premium", Altura: "12 cm", Edicion: "Limitada 500 uds", Acabado: "UV reactivo" },
    stock: 48,
    category: "Edicion Galactica",
  },
  {
    name: "BluePaw",
    price: 19.99,
    image: "/characters/2.png",
    description: "Gato azul con orejas rojas, companero fiel",
    extendedDescription: "BluePaw es el guardian del barrio StarPals. Sus orejas rojas detectan peligros a kilometros de distancia. Fabricado en vinilo de alta calidad con articulaciones en cuello y brazos.",
    specs: { Material: "Vinilo articulado", Altura: "10 cm", Articulaciones: "2 puntos", Serie: "Guardianes" },
    stock: 72,
    category: "Serie Guardianes",
  },
  {
    name: "Cream Puff",
    price: 18.99,
    image: "/characters/3.png",
    description: "Conejito crema suave, el mas dulce de todos",
    extendedDescription: "Cream Puff es la ternura personificada. Su textura suave al tacto y sus mejillas rosadas hacen de este coleccionable uno de los mas populares de la coleccion. Incluye peana decorativa.",
    specs: { Material: "PVC soft-touch", Altura: "9 cm", Incluye: "Peana decorativa", Serie: "Dulces" },
    stock: 95,
    category: "Serie Dulces",
  },
  {
    name: "Cloudberry",
    price: 22.99,
    image: "/characters/4.png",
    description: "Nube magica con brazos de algodon de azucar",
    extendedDescription: "Cloudberry flota entre las nubes del universo StarPals. Sus brazos bicolores representan el amanecer y el atardecer. Figura translucida con efecto nube interior.",
    specs: { Material: "PVC translucido", Altura: "11 cm", Efecto: "Nube interior", Edicion: "Temporada" },
    stock: 60,
    category: "Edicion Clima",
  },
  {
    name: "Leo Hoodie",
    price: 29.99,
    image: "/characters/5.png",
    description: "Leon en hoodie rojo, el mas valiente de la manada",
    extendedDescription: "Leo Hoodie es el lider indiscutible. Su hoodie rojo esconde un corazon de oro. Esta figura incluye accesorios intercambiables y viene en caja coleccionable con diseno premium.",
    specs: { Material: "PVC + tela", Altura: "13 cm", Accesorios: "3 intercambiables", Caja: "Coleccionable" },
    stock: 35,
    category: "Serie Lideres",
  },
  {
    name: "SpaceKid",
    price: 34.99,
    image: "/characters/6.png",
    description: "Astronauta explorador con traje celeste",
    extendedDescription: "SpaceKid lleva anos explorando galaxias lejanas. Su traje azul celeste con detalles naranja esta inspirado en misiones reales de la NASA. La figura mas tecnicamente detallada de toda la coleccion.",
    specs: { Material: "PVC de alta precision", Altura: "14 cm", Detalles: "48 piezas", Edicion: "Exploracion" },
    stock: 28,
    category: "Edicion Espacial",
  },
  {
    name: "Robiton Deluxe",
    price: 39.99,
    image: "/characters/7.png",
    description: "Robot retro con pantalla amarilla y sombrero rojo",
    extendedDescription: "Robiton es el inventor oficial de StarPals. Su cabeza-pantalla cambia de expresion con luz LED integrada. El unico coleccionable de la linea con componentes electronicos.",
    specs: { Material: "ABS + LED", Altura: "15 cm", Funcion: "LED interactivo", Bateria: "CR2032 incluida" },
    stock: 20,
    category: "Edicion Tech",
  },
  {
    name: "Heartsy Rock",
    price: 16.99,
    image: "/characters/8.png",
    description: "Roca corazon con ojos cruzados, el mas raro",
    extendedDescription: "Heartsy Rock desafia toda logica. Sus ojos cruzados azul y rojo son la firma del artista coleccionista Miru Park. Edicion artistica numerada.",
    specs: { Material: "Resina artistica", Altura: "8 cm", Numeracion: "Individual", Artista: "Miru Park" },
    stock: 150,
    category: "Edicion Artistica",
  },
  {
    name: "MysticKat Crystal",
    price: 44.99,
    image: "/characters/9.png",
    description: "Gato purpura con cristal de poder, el mas mistico",
    extendedDescription: "MysticKat proviene de una dimension paralela donde los gatos gobiernan el universo. Su cristal azul esta hecho de vidrio borosilicato genuino. La figura mas exclusiva de StarPals.",
    specs: { Material: "PVC premium + vidrio", Altura: "16 cm", Cristal: "Vidrio borosilicato", Edicion: "Ultra-limitada 200 uds" },
    stock: 12,
    category: "Edicion Mistica",
  },
  {
    name: "TealBun Lucky",
    price: 21.99,
    image: "/characters/10.png",
    description: "Conejo teal con orejas bicolores y bigotes traviesos",
    extendedDescription: "TealBun es el amuleto de buena suerte de StarPals. La leyenda dice que quien lo coleccione tendra buena suerte durante 77 dias. Viene con certificado de buena suerte oficial.",
    specs: { Material: "PVC mate", Altura: "12 cm", Incluye: "Certificado de buena suerte", Serie: "Lucky" },
    stock: 80,
    category: "Serie Lucky",
  },
];

async function seed() {
  console.log("Seeding products to Firestore...");
  for (const product of products) {
    const ref = db.collection("products").doc();
    await ref.set({ id: ref.id, ...product });
    console.log(`Created: ${product.name} (${ref.id})`);
  }
  console.log("Seed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
