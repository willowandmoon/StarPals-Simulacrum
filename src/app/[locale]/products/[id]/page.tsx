"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import {
  Box, Container, Typography, Button, Chip, Divider,
  Table, TableBody, TableRow, TableCell, Snackbar, Alert, CircularProgress
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteButton from "@/components/FavoriteButton";
import type { Product } from "@/types/global";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const t = useTranslations("product");
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "warning" }>({
    open: false, message: "", severity: "success",
  });

  useEffect(() => {
    fetch(`/api/products?id=${id}`)
      .then((r) => r.json())
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!session) {
      setSnack({ open: true, message: t("loginRequired"), severity: "warning" });
      setTimeout(() => router.push("/login"), 1500);
      return;
    }
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product!.id,
        productName: product!.name,
        productImage: product!.image,
        price: product!.price,
        quantity: 1,
      }),
    });
    setSnack({ open: true, message: "Agregado al carrito!", severity: "success" });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#1B2464" }} />
      </Box>
    );
  }

  if (!product) return null;

  return (
    <Box sx={{ bgcolor: "#F5F0E8", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Button component={Link} href="/" startIcon={<ArrowBackIcon />}
          sx={{ mb: 3, color: "#1B2464", fontWeight: 700 }}>
          {t("back")}
        </Button>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
          <Box sx={{
            bgcolor: "#1B2464", borderRadius: 4, position: "relative", minHeight: 400,
          }}>
            <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>
              <FavoriteButton productId={product.id} />
            </Box>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: "contain", padding: "48px", filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.5))" }}
            />
          </Box>

          <Box>
            <Chip label={product.category} size="small"
              sx={{ bgcolor: "#F5C518", color: "#1B2464", fontWeight: 700, mb: 2 }} />
            <Typography variant="h4" sx={{ color: "#1B2464", mb: 1, fontWeight: 900 }}>
              {product.name}
            </Typography>
            <Typography variant="h5" sx={{ color: "#F5C518", bgcolor: "#1B2464", fontWeight: 900,
              display: "inline-block", px: 2, py: 0.5, borderRadius: 2, mb: 3 }}>
              ${product.price.toFixed(2)}
            </Typography>

            <Typography sx={{ color: "#444", mb: 3, lineHeight: 1.7 }}>
              {product.extendedDescription}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle1" sx={{ color: "#1B2464", mb: 1, fontWeight: 800 }}>
              {t("specs")}
            </Typography>
            <Table size="small" sx={{ mb: 3 }}>
              <TableBody>
                {Object.entries(product.specs || {}).map(([key, val]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontWeight: 700, color: "#666", border: "none", pl: 0 }}>{key}</TableCell>
                    <TableCell sx={{ color: "#1B2464", fontWeight: 600, border: "none" }}>{val}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#666", border: "none", pl: 0 }}>{t("stock")}</TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Chip label={product.stock} size="small"
                      sx={{ bgcolor: product.stock > 0 ? "#1B2464" : "#ccc", color: "white", fontWeight: 700 }} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              sx={{
                bgcolor: "#1B2464", fontWeight: 800, fontSize: "1rem", py: 1.5, borderRadius: 3,
                "&:hover": { bgcolor: "#232d82" },
              }}
            >
              {t("addToCart")}
            </Button>
          </Box>
        </Box>
      </Container>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} sx={{ fontWeight: 600 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
