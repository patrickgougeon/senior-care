import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "SeniorCare — Detecção inteligente de quedas",
    template: "%s | SeniorCare",
  },
  description:
    "O SeniorCare monitora idosos 24 horas por dia e mostra um alerta no dashboard em caso de queda — mesmo quando você está em outro cômodo.",
  keywords: ["queda idoso", "monitoramento idoso", "detecção queda", "cuidado idoso", "sensor queda"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
