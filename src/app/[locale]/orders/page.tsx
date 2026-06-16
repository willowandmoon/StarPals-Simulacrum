"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import {
  Box, Container, Typography, Button, Paper, Chip,
  CircularProgress, Divider, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import type { Sale, Product } from "@/types/global.d";

export default function OrdersPage() {
  const { status } = useSession();
  const t = useTranslations("orders");
  const locale = useLocale();
  const router = useRouter();
  const [orders, setOrders] = useState<Sale[]>([]);
  const [productMap, setProductMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/orders").then((r) => r.ok ? r.json() : []),
      fetch("/api/products").then((r) => r.ok ? r.json() : []),
    ]).then(([ordersData, productsData]) => {
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      const map = new Map<string, string>();
      if (Array.isArray(productsData)) {
        (productsData as Product[]).forEach((p) => map.set(p.id, p.image));
      }
      setProductMap(map);
    }).finally(() => setLoading(false));
  }, [status, router]);

  // Obtiene la imagen correcta: primero del producto actual, luego la guardada en la venta
  const getImage = (productId: string, storedImage?: string) =>
    productMap.get(productId) ?? storedImage ?? "/characters/1.png";

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
          <Image src="/characters/5.png" alt="" width={56} height={56} style={{ height: "auto" }} />
          <Typography variant="h4" sx={{ color: "#1B2464", fontWeight: 900 }}>
            {t("title")}
          </Typography>
        </Box>

        {orders.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Image src="/characters/9.png" alt="" width={140} height={140} style={{ height: "auto" }} />
            <Typography sx={{ color: "#888", mt: 2, mb: 3, fontSize: "1.1rem" }}>{t("empty")}</Typography>
            <Button component={Link} href="/" variant="contained"
              sx={{ bgcolor: "#1B2464", fontWeight: 800, borderRadius: 2 }}>
              {t("browseCatalog")}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {orders.map((order, idx) => {
              const date = new Date(order.createdAt);
              const formattedDate = date.toLocaleDateString(locale, {
                year: "numeric", month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              });
              return (
                <Accordion key={order.id} disableGutters elevation={0}
                  sx={{ border: "2px solid rgba(27,36,100,0.1)", borderRadius: "8px !important",
                    overflow: "hidden", "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#1B2464" }} />}
                    sx={{ bgcolor: "white", px: 3, py: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", width: "100%" }}>
                      <ReceiptLongIcon sx={{ color: "#1B2464", opacity: 0.5, flexShrink: 0 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: "#1B2464" }}>
                          {t("order")} #{orders.length - idx}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#888" }}>{formattedDate}</Typography>
                      </Box>
                      {/* Miniaturas de personajes */}
                      <Box sx={{ display: "flex", gap: 0.5, mr: 1 }}>
                        {order.items.slice(0, 4).map((item) => (
                          <Box key={item.productId} sx={{
                            width: 32, height: 32, bgcolor: "#1B2464",
                            borderRadius: 1, position: "relative", flexShrink: 0,
                            border: "2px solid rgba(245,197,24,0.5)",
                          }}>
                            <Image
                              src={getImage(item.productId, item.productImage)}
                              alt={item.productName}
                              fill
                              sizes="32px"
                              style={{ objectFit: "contain", padding: 3 }}
                            />
                          </Box>
                        ))}
                        {order.items.length > 4 && (
                          <Box sx={{ width: 32, height: 32, bgcolor: "rgba(27,36,100,0.08)",
                            borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: "#1B2464" }}>
                              +{order.items.length - 4}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Chip label={`$${order.total.toFixed(2)}`}
                        sx={{ bgcolor: "#1B2464", color: "#F5C518", fontWeight: 900, fontSize: "0.9rem" }} />
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ bgcolor: "#fafafa", px: 3, py: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {order.items.map((item) => (
                        <Box key={item.productId} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          {/* Imagen del personaje */}
                          <Paper elevation={0} sx={{
                            width: 52, height: 52, bgcolor: "#1B2464", borderRadius: 1.5,
                            position: "relative", flexShrink: 0, overflow: "hidden",
                          }}>
                            <Image
                              src={getImage(item.productId, item.productImage)}
                              alt={item.productName}
                              fill
                              sizes="52px"
                              style={{ objectFit: "contain", padding: 6 }}
                            />
                          </Paper>

                          <Box sx={{ flexGrow: 1 }}>
                            <Typography sx={{ fontWeight: 700, color: "#1B2464" }}>
                              {item.productName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#888" }}>
                              ${item.price.toFixed(2)} {t("qty")} {item.quantity}
                            </Typography>
                          </Box>

                          <Typography sx={{ fontWeight: 800, color: "#1B2464", minWidth: 70, textAlign: "right" }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Divider sx={{ mt: 2, mb: 1.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2 }}>
                      <Typography sx={{ fontWeight: 700, color: "#666" }}>{t("total")}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: "#F5C518",
                        bgcolor: "#1B2464", px: 2, py: 0.5, borderRadius: 2 }}>
                        ${order.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}
