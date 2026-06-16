import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAllProducts } from "@/services/productService";
import { getFavorites } from "@/services/favoritesService";
import ProductCard from "@/components/ProductCard";
import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";

export default async function HomePage() {
  const t = await getTranslations("home");
  const session = await getServerSession(authOptions);
  const products = await getAllProducts();

  let favoritedIds = new Set<string>();
  if (session?.user?.id) {
    const favs = await getFavorites(session.user.id);
    favoritedIds = new Set(favs.map((f) => f.productId));
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F0E8" }}>
      {/* Hero */}
      <Box
        sx={{
          bgcolor: "#1B2464",
          py: { xs: 6, md: 10 },
          px: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", left: "5%", bottom: 0, opacity: 0.5, display: { xs: "none", md: "block" } }}>
          <Image src="/characters/3.png" alt="" width={120} height={120} className="char-float" style={{ height: "auto" }} />
        </Box>
        <Box sx={{ position: "absolute", right: "5%", bottom: 0, opacity: 0.5, display: { xs: "none", md: "block" } }}>
          <Image src="/characters/10.png" alt="" width={120} height={120} className="char-float" style={{ animationDelay: "1s", height: "auto" }} />
        </Box>
        <Box sx={{ position: "absolute", left: "20%", top: "10%", opacity: 0.3, display: { xs: "none", lg: "block" } }}>
          <Image src="/characters/4.png" alt="" width={80} height={80} className="char-float" style={{ animationDelay: "2s", height: "auto" }} />
        </Box>
        <Box sx={{ position: "absolute", right: "20%", top: "10%", opacity: 0.3, display: { xs: "none", lg: "block" } }}>
          <Image src="/characters/9.png" alt="" width={80} height={80} className="char-float" style={{ animationDelay: "0.5s", height: "auto" }} />
        </Box>

        <Container maxWidth="md" sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <Typography variant="h2" sx={{ color: "#F5C518", mb: 2, fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 900 }}>
            ★ StarPals
          </Typography>
          <Typography variant="h5" sx={{ color: "white", mb: 1, fontWeight: 700 }}>
            {t("title")}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}>
            {t("subtitle")}
          </Typography>
        </Container>
      </Box>

      {/* Product grid */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 3,
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorited={favoritedIds.has(product.id)}
            />
          ))}
        </Box>
        {products.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Image src="/characters/8.png" alt="" width={120} height={120} style={{ height: "auto" }} />
            <Typography sx={{ color: "#888", mt: 2 }}>No hay productos aún</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
