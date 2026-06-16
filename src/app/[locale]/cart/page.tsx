"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import {
  Box, Container, Typography, Button, IconButton, Paper,
  Table, TableBody, TableRow, TableCell, TableHead, Divider,
  CircularProgress, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useStore } from "@/context/StoreContext";
import type { Cart, CartItem, Product } from "@/types/global.d";

interface StockConflict {
  item: CartItem;
  available: number;
}

export default function CartPage() {
  const { status } = useSession();
  const t = useTranslations("cart");
  const ts = useTranslations("stock");
  const router = useRouter();
  const { refreshCart } = useStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [conflicts, setConflicts] = useState<StockConflict[]>([]);
  const [conflictOpen, setConflictOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetch("/api/cart").then((r) => r.json()).then(setCart).finally(() => setLoading(false));
  }, [status, router]);

  const updateQty = async (productId: string, newQty: number) => {
    if (newQty < 1) { removeItem(productId); return; }
    setCart((prev) => prev
      ? { ...prev, items: prev.items.map((i) => i.productId === productId ? { ...i, quantity: newQty } : i) }
      : prev
    );
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: newQty }),
    });
    refreshCart();
  };

  const removeItem = async (productId: string) => {
    setCart((prev) => prev ? { ...prev, items: prev.items.filter((i) => i.productId !== productId) } : prev);
    await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
    refreshCart();
  };

  const doCheckout = async (itemsToCheckout: CartItem[]) => {
    setCheckingOut(true);
    const total = itemsToCheckout.reduce((s, i) => s + i.price * i.quantity, 0);
    const saleItems = itemsToCheckout.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      productImage: i.productImage,
      price: i.price,
      quantity: i.quantity,
    }));
    await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: saleItems, total }),
    });
    setCart((prev) => prev ? { ...prev, items: [] } : prev);
    setCheckingOut(false);
    setSuccess(true);
    refreshCart();
  };

  const checkout = async () => {
    const currentItems = cart?.items;
    if (!currentItems?.length) return;

    // Verificar stock actual de todos los productos
    const productsRes = await fetch("/api/products");
    const allProducts: Product[] = await productsRes.json();

    const found: StockConflict[] = [];
    for (const item of currentItems) {
      const product = allProducts.find((p) => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        found.push({ item, available: product.stock });
      }
    }

    if (found.length > 0) {
      setConflicts(found);
      setConflictOpen(true);
      return;
    }

    await doCheckout(currentItems);
  };

  // "Comprar lo disponible": ajusta cantidades al stock real, elimina los agotados
  const handleBuyAvailable = async () => {
    setConflictOpen(false);
    if (!cart?.items) return;

    const conflictMap = new Map(conflicts.map((c) => [c.item.productId, c.available]));
    const adjusted = cart.items
      .map((i) => conflictMap.has(i.productId) ? { ...i, quantity: conflictMap.get(i.productId)! } : i)
      .filter((i) => i.quantity > 0);

    // Actualizar cantidades en Firestore para los ajustados
    await Promise.all(
      conflicts.map((c) =>
        c.available === 0
          ? fetch(`/api/cart?productId=${c.item.productId}`, { method: "DELETE" })
          : fetch("/api/cart", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: c.item.productId, quantity: c.available }),
            })
      )
    );

    if (adjusted.length === 0) {
      setCart((prev) => prev ? { ...prev, items: [] } : prev);
      refreshCart();
      return;
    }

    setCart((prev) => prev ? { ...prev, items: adjusted } : prev);
    await doCheckout(adjusted);
  };

  const items: CartItem[] = cart?.items || [];
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (loading || status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#1B2464" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F5F0E8", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Image src="/characters/7.png" alt="" width={56} height={56} style={{ height: "auto" }} />
          <Typography variant="h4" sx={{ color: "#1B2464", fontWeight: 900 }}>
            {t("title")}
          </Typography>
        </Box>

        {items.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Image src="/characters/6.png" alt="" width={140} height={140} style={{ height: "auto" }} />
            <Typography sx={{ color: "#888", mt: 2, mb: 3, fontSize: "1.1rem" }}>{t("empty")}</Typography>
            <Button component={Link} href="/" variant="contained"
              sx={{ bgcolor: "#1B2464", fontWeight: 800, borderRadius: 2 }}>
              {t("continueShopping")}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr auto" }, gap: 3 }}>
            {/* Lista */}
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", border: "2px solid rgba(27,36,100,0.08)" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#1B2464" }}>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>{t("product")}</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700, textAlign: "center" }}>{t("quantity")}</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700, textAlign: "right" }}>Subtotal</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.productId} sx={{ "&:last-child td": { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box sx={{ position: "relative", width: 48, height: 48, bgcolor: "#1B2464", borderRadius: 1, flexShrink: 0 }}>
                            <Image src={item.productImage} alt={item.productName} fill sizes="48px"
                              style={{ objectFit: "contain", padding: 4 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: "#1B2464", fontSize: "0.9rem" }}>
                              {item.productName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#888" }}>
                              ${item.price.toFixed(2)} {t("each")}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ textAlign: "center" }}>
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5,
                          border: "2px solid rgba(27,36,100,0.15)", borderRadius: 2, px: 0.5 }}>
                          <IconButton size="small" onClick={() => updateQty(item.productId, item.quantity - 1)}
                            sx={{ color: "#1B2464", p: 0.25 }}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ fontWeight: 800, color: "#1B2464", minWidth: 24, textAlign: "center" }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => updateQty(item.productId, item.quantity + 1)}
                            sx={{ color: "#1B2464", p: 0.25 }}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontWeight: 800, color: "#1B2464" }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ pr: 1 }}>
                        <IconButton onClick={() => removeItem(item.productId)} size="small" sx={{ color: "#e53935" }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {/* Resumen */}
            <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: "2px solid rgba(27,36,100,0.08)", minWidth: 220, height: "fit-content" }}>
              <Typography variant="h6" sx={{ color: "#1B2464", mb: 2, fontWeight: 900 }}>{t("summary")}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography sx={{ fontWeight: 700 }}>{t("total")}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#F5C518", bgcolor: "#1B2464", px: 2, py: 0.5, borderRadius: 2 }}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
              <Button variant="contained" fullWidth size="large" startIcon={<ShoppingBagIcon />}
                onClick={checkout} disabled={checkingOut}
                sx={{ bgcolor: "#1B2464", fontWeight: 800, borderRadius: 2, py: 1.5 }}>
                {checkingOut ? <CircularProgress size={22} color="inherit" /> : t("checkout")}
              </Button>
              <Button component={Link} href="/orders" variant="text" fullWidth size="small"
                sx={{ mt: 1.5, color: "#1B2464", fontWeight: 600, opacity: 0.7 }}>
                {t("orderHistory")}
              </Button>
            </Paper>
          </Box>
        )}
      </Container>

      {/* Dialog de stock insuficiente */}
      <Dialog open={conflictOpen} onClose={() => setConflictOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ bgcolor: "#1B2464", color: "white", display: "flex", alignItems: "center", gap: 1.5 }}>
          <WarningAmberIcon sx={{ color: "#F5C518" }} />
          {ts("dialogTitle")}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: "#555", mb: 2 }}>{ts("dialogDesc")}</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {conflicts.map(({ item, available }) => (
              <Box key={item.productId} sx={{ display: "flex", alignItems: "center", gap: 2,
                p: 1.5, bgcolor: "#fff8e1", borderRadius: 2, border: "1.5px solid #F5C518" }}>
                <Box sx={{ position: "relative", width: 52, height: 52, bgcolor: "#1B2464", borderRadius: 1.5, flexShrink: 0 }}>
                  <Image src={item.productImage} alt={item.productName} fill sizes="52px"
                    style={{ objectFit: "contain", padding: 6 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 800, color: "#1B2464" }}>{item.productName}</Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                    <Chip label={`${available} ${ts("available")}`}
                      size="small" sx={{ bgcolor: available > 0 ? "#e8f5e9" : "#ffebee",
                        color: available > 0 ? "#2e7d32" : "#c62828", fontWeight: 700 }} />
                    <Chip label={`${item.quantity} ${ts("inCart")}`}
                      size="small" sx={{ bgcolor: "#e3e8f7", color: "#1B2464", fontWeight: 700 }} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConflictOpen(false)} variant="outlined"
            sx={{ borderColor: "#1B2464", color: "#1B2464", fontWeight: 700, borderRadius: 2 }}>
            {ts("adjust")}
          </Button>
          <Button onClick={handleBuyAvailable} variant="contained"
            disabled={conflicts.every((c) => c.available === 0)}
            sx={{ bgcolor: "#1B2464", fontWeight: 800, borderRadius: 2 }}>
            {ts("buyAvailable")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 700 }}>
          {t("orderSuccess")} 🎉
        </Alert>
      </Snackbar>
    </Box>
  );
}
