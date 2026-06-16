"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter, Link } from "@/i18n/navigation";
import { Card, CardContent, Typography, Box, Chip, Button, Snackbar, Alert } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import { useStore } from "@/context/StoreContext";
import type { Product } from "@/types/global.d";

interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
}

export default function ProductCard({ product, isFavorited = false }: ProductCardProps) {
  const t = useTranslations("home");
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cartItems, favIds, storeLoaded, refreshCart, refreshFavs } = useStore();

  const cartItem = cartItems.find((i) => i.productId === product.id);
  const inCart = !!cartItem;
  const cartQty = cartItem?.quantity ?? 0;

  // Use server-rendered prop until context finishes loading, then trust context
  const favorited = storeLoaded ? favIds.has(product.id) : isFavorited;

  const [favLoading, setFavLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false, msg: "", severity: "success",
  });

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === "loading") return;
    if (!session) { router.push("/login"); return; }
    setFavLoading(true);
    try {
      await fetch(
        favorited ? `/api/favorites?productId=${product.id}` : "/api/favorites",
        {
          method: favorited ? "DELETE" : "POST",
          headers: favorited ? undefined : { "Content-Type": "application/json" },
          body: favorited ? undefined : JSON.stringify({ productId: product.id }),
        }
      );
      refreshFavs();
    } finally {
      setFavLoading(false);
    }
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) { router.push("/login"); return; }
    setCartLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          price: product.price,
          quantity: 1,
        }),
      });
      if (res.ok) {
        refreshCart();
        setSnack({
          open: true,
          msg: inCart ? t("nowHave", { qty: cartQty + 1 }) : t("addedToCart"),
          severity: "success",
        });
      } else {
        setSnack({ open: true, msg: t("addError"), severity: "error" });
      }
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          transition: "transform 0.25s, box-shadow 0.25s",
          "&:hover": { transform: "translateY(-6px)", boxShadow: "0 16px 40px rgba(27,36,100,0.22)" },
          bgcolor: "#1B2464",
          color: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Link href={`/products/${product.id}`} style={{ display: "block" }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #1e2b7a 0%, #232d82 100%)",
              position: "relative",
              height: 200,
            }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 20vw"
              style={{ objectFit: "contain", padding: "24px", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))" }}
            />
          </Box>
        </Link>

        <CardContent sx={{ pb: "16px !important", flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.75 }}>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.2, fontWeight: 800 }}>
              {product.name}
            </Typography>
            <Chip
              label={product.stock > 0 ? t("inStock") : t("outOfStock")}
              size="small"
              sx={{
                bgcolor: product.stock > 0 ? "#F5C518" : "rgba(255,255,255,0.2)",
                color: product.stock > 0 ? "#1B2464" : "white",
                fontWeight: 700, fontSize: "0.65rem", flexShrink: 0, ml: 1,
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1, fontSize: "0.8rem", flexGrow: 1 }}>
            {product.description}
          </Typography>

          <Typography variant="h6" sx={{ color: "#F5C518", fontWeight: 900, mb: 1.5 }}>
            ${product.price.toFixed(2)}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Favorito */}
            <Button
              onClick={toggleFavorite}
              disabled={favLoading}
              variant={favorited ? "contained" : "outlined"}
              size="small"
              startIcon={favorited ? <StarIcon /> : <StarBorderIcon />}
              sx={{
                flex: 1,
                fontWeight: 700,
                borderRadius: 1.5,
                borderColor: favorited ? "#F5C518" : "rgba(255,255,255,0.4)",
                bgcolor: favorited ? "#F5C518" : "transparent",
                color: favorited ? "#1B2464" : "white",
                fontSize: "0.75rem",
                "&:hover": {
                  bgcolor: favorited ? "#e6b800" : "rgba(245,197,24,0.15)",
                  borderColor: "#F5C518",
                  color: favorited ? "#1B2464" : "#F5C518",
                },
              }}
            >
              {favorited ? t("saved") : t("favorite")}
            </Button>

            {/* Carrito */}
            <Button
              onClick={addToCart}
              disabled={cartLoading || product.stock === 0}
              variant="contained"
              size="small"
              startIcon={inCart ? <AddIcon /> : <ShoppingCartIcon />}
              sx={{
                flex: 1,
                fontWeight: 700,
                borderRadius: 3,
                bgcolor: inCart ? "rgba(245,197,24,0.2)" : "#F5C518",
                color: inCart ? "#F5C518" : "#1B2464",
                border: inCart ? "1.5px solid #F5C518" : "none",
                fontSize: "0.75rem",
                "&:hover": {
                  bgcolor: inCart ? "rgba(245,197,24,0.3)" : "#e6b800",
                },
                "&.Mui-disabled": {
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.3)",
                },
              }}
            >
              {product.stock === 0
                ? t("noStock")
                : inCart
                ? t("inCart", { qty: cartQty })
                : t("add")}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 700 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
