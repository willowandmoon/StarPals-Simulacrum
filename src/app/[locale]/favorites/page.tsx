"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { Box, Container, Typography, Button, CircularProgress } from "@mui/material";
import ProductCard from "@/components/ProductCard";
import type { Product, Favorite } from "@/types/global";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const t = useTranslations("favorites");
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/favorites").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([favs, allProducts]: [Favorite[], Product[]]) => {
      const favList = Array.isArray(favs) ? favs : [];
      const allList = Array.isArray(allProducts) ? allProducts : [];
      const favIds = new Set(favList.map((f) => f.productId));
      setProducts(allList.filter((p) => favIds.has(p.id)));
    }).finally(() => setLoading(false));
  }, [status, router]);

  if (loading || status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#1B2464" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F5F0E8", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Image src="/characters/4.png" alt="" width={56} height={56} style={{ height: "auto" }} />
          <Typography variant="h4" sx={{ color: "#1B2464", fontWeight: 900 }}>
            {t("title")}
          </Typography>
        </Box>

        {products.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Image src="/characters/8.png" alt="" width={140} height={140} style={{ height: "auto" }} />
            <Typography sx={{ color: "#888", mt: 2, mb: 3, fontSize: "1.1rem" }}>
              {t("empty")}
            </Typography>
            <Button component={Link} href="/" variant="contained"
              sx={{ bgcolor: "#1B2464", fontWeight: 800, borderRadius: 3 }}>
              {t("browseCatalog")}
            </Button>
          </Box>
        ) : (
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(3,1fr)", md: "repeat(4,1fr)", lg: "repeat(5,1fr)" },
            gap: 3,
          }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} isFavorited />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
