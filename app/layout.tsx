import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ReactQueryProvider } from "@/lib/providers/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kairo Digital - Plateforme CRM",
  description: "Plateforme CRM et e-commerce complète",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
