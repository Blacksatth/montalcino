import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/public/CartProvider";
import { CartDrawer } from "@/components/public/CartDrawer";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Montalchino — Colecciones exclusivas",
  description: "Tienda de la marca Montalchino: colecciones exclusivas, piezas únicas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("montalchino-theme");var d=t?t==="dark":true;document.documentElement.classList.toggle("dark",d)}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}