import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ["latin"],
  variable: '--font-lora',
  display: 'swap',
});

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
      <body className={`${inter.variable} ${lora.variable} font-inter`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
