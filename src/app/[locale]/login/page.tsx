"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import {
  Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress
} from "@mui/material";

export default function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError(t("error"));
    } else {
      router.push("/");
    }
  };

  return (
    <Box sx={{ bgcolor: "#F5F0E8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
      <Box sx={{ position: "fixed", left: "5%", bottom: "10%", opacity: 0.4, display: { xs: "none", md: "block" } }}>
        <Image src="/characters/2.png" alt="" width={140} height={140} className="char-float" style={{ height: "auto" }} />
      </Box>
      <Box sx={{ position: "fixed", right: "5%", top: "20%", opacity: 0.4, display: { xs: "none", md: "block" } }}>
        <Image src="/characters/6.png" alt="" width={140} height={140} className="char-float" style={{ animationDelay: "1.5s", height: "auto" }} />
      </Box>

      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ borderRadius: 4, p: 4, border: "2px solid rgba(27,36,100,0.08)" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Image src="/characters/1.png" alt="StarPals" width={72} height={72}
              style={{ borderRadius: "50%", background: "#1B2464", padding: 8, height: "auto" }} />
            <Typography variant="h4" sx={{ color: "#1B2464", mt: 2, fontWeight: 900 }}>
              {t("title")}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label={t("email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />
            <TextField
              label={t("password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ bgcolor: "#1B2464", fontWeight: 800, py: 1.5, borderRadius: 3,
                "&:hover": { bgcolor: "#232d82" } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t("submit")}
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {t("noAccount")}{" "}
              <Link href="/register" style={{ color: "#1B2464", fontWeight: 800, textDecoration: "none" }}>
                {t("signUp")}
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
