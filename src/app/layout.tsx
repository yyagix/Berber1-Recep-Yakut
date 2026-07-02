import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/ToastProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recep Yakut Hair Academy",
  description: "Ankara'nın en prestijli erkek kuaförü ve hair academy'si.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${playfair.variable} ${outfit.variable} antialiased scroll-smooth`}
    >
      <body className="font-sans bg-background text-foreground">
        <div className="w-full overflow-x-hidden min-h-screen flex flex-col">
          <Navbar />
          {children}
          <ToastProvider />
        </div>
      </body>
    </html>
  );
}
