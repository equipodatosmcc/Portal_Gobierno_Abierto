import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gobierno Abierto",
  description: "Proyecto Next.js con App Router, TypeScript y Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
