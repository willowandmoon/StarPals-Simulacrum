"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { NextIntlClientProvider } from "next-intl";
import { StoreProvider } from "@/context/StoreContext";

const theme = createTheme({
  palette: {
    primary: { main: "#1B2464" },
    secondary: { main: "#F5C518" },
    background: { default: "#F5F0E8" },
  },
  typography: {
    fontFamily: "'Nunito', sans-serif",
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
});

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

export default function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="America/Bogota">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <StoreProvider>
            {children}
          </StoreProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
