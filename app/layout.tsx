import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gobiernoabierto.ciudaddecorrientes.gov.ar"),
  title: "Portal de Gobierno Abierto | Municipalidad de Corrientes",
  description:
    "Transparencia, participacion ciudadana y datos abiertos al servicio de los correntinos.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://gobiernoabierto.ciudaddecorrientes.gov.ar",
    siteName: "Portal de Gobierno Abierto - Municipalidad de Corrientes",
    title: "Portal de Gobierno Abierto | Municipalidad de Corrientes",
    description:
      "Transparencia, participacion ciudadana y datos abiertos al servicio de los correntinos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal de Gobierno Abierto | Municipalidad de Corrientes",
    description:
      "Transparencia, participacion ciudadana y datos abiertos al servicio de los correntinos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>{children}</body>
    </html>
  );
}
