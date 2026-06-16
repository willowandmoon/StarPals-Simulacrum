"use client";
import { useSession, signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import {
  AppBar, Toolbar, Box, Button, IconButton, Badge, Select,
  MenuItem, Typography, Avatar
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LogoutIcon from "@mui/icons-material/Logout";
import { useStore } from "@/context/StoreContext";

export default function Navbar() {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const { cartCount, favCount } = useStore();

  const handleLocaleChange = (newLocale: string) => {
    router.replace("/", { locale: newLocale });
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: "#1B2464", boxShadow: "0 2px 20px rgba(27,36,100,0.3)" }}>
      <Toolbar sx={{ gap: 1, px: { xs: 2, md: 4 } }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexGrow: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.1)", overflow: "hidden", flexShrink: 0 }}>
            <Image src="/characters/1.png" alt="StarPals" width={36} height={36} style={{ display: "block", height: "auto" }} />
          </Box>
          <Typography variant="h6" sx={{ color: "#F5C518", fontWeight: 900, letterSpacing: 1 }}>
            StarPals
          </Typography>
        </Link>

        <Button component={Link} href="/" sx={{ color: "white", fontWeight: 600 }}>
          {t("home")}
        </Button>

        {session && (
          <IconButton component={Link} href="/favorites" sx={{ color: "white" }}>
            <Badge
              badgeContent={favCount}
              color="secondary"
              sx={{ "& .MuiBadge-badge": { fontWeight: 800, fontSize: "0.7rem" } }}
            >
              <StarIcon />
            </Badge>
          </IconButton>
        )}

        {session && (
          <IconButton component={Link} href="/orders" sx={{ color: "white" }} title={t("orders")}>
            <ReceiptLongIcon />
          </IconButton>
        )}

        {session && (
          <IconButton component={Link} href="/cart" sx={{ color: "white" }}>
            <Badge
              badgeContent={cartCount}
              color="secondary"
              sx={{ "& .MuiBadge-badge": { fontWeight: 800, fontSize: "0.7rem" } }}
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        )}

        {session ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#F5C518", color: "#1B2464", fontWeight: 900, fontSize: 14 }}>
              {session.user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography sx={{ color: "white", fontWeight: 600, display: { xs: "none", sm: "block" } }}>
              {t("hello", { name: session.user?.name?.split(" ")[0] ?? "" })}
            </Typography>
            <IconButton onClick={() => signOut({ callbackUrl: `/${locale}` })} sx={{ color: "rgba(255,255,255,0.7)" }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button component={Link} href="/login" variant="outlined"
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.5)", "&:hover": { borderColor: "white" } }}>
              {t("login")}
            </Button>
            <Button component={Link} href="/register" variant="contained" color="secondary"
              sx={{ color: "#1B2464", fontWeight: 800 }}>
              {t("register")}
            </Button>
          </Box>
        )}

        <Select
          value={locale ?? "es"}
          onChange={(e) => handleLocaleChange(e.target.value)}
          size="small"
          sx={{
            color: "white", ml: 1,
            ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
            ".MuiSvgIcon-root": { color: "white" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
            minWidth: 70,
          }}
        >
          <MenuItem value="es">🇨🇴 ES</MenuItem>
          <MenuItem value="en">🇺🇸 EN</MenuItem>
          <MenuItem value="pt">🇧🇷 PT</MenuItem>
        </Select>
      </Toolbar>
    </AppBar>
  );
}
