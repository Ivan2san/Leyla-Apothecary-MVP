import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leyla's Apothecary - Natural Herbal Wellness",
  description: "Premium herbal tinctures and personalized naturopathy consultations. Custom compound creation for your unique health journey.",
  keywords: ["herbal medicine", "naturopathy", "tinctures", "holistic health", "wellness"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
