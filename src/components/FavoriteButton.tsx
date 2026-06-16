"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { IconButton, Tooltip } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface FavoriteButtonProps {
  productId: string;
  initialFavorited?: boolean;
}

export default function FavoriteButton({ productId, initialFavorited = false }: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const t = useTranslations("home");
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      if (favorited) {
        await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      }
      setFavorited(!favorited);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={favorited ? t("removeFavorite") : t("addFavorite")}>
      <IconButton
        onClick={toggle}
        disabled={loading}
        size="medium"
        sx={{
          bgcolor: favorited ? "#F5C518" : "rgba(255,255,255,0.15)",
          backdropFilter: "blur(4px)",
          color: favorited ? "#1B2464" : "white",
          border: "2px solid",
          borderColor: favorited ? "#F5C518" : "rgba(255,255,255,0.4)",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: favorited ? "#e6b800" : "rgba(245,197,24,0.25)",
            borderColor: "#F5C518",
            color: "#F5C518",
            transform: "scale(1.15)",
          },
        }}
      >
        {favorited ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
