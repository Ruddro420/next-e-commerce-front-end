import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryNav from "@/components/layout/CategoryNav";
import { CartProvider } from "@/store/cartStore";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-slate-50 text-slate-900">
        <AuthProvider>
          <CartProvider>
            <Header />
            <CategoryNav />
            <hr className="text-slate-200" />
            {children}
            <Footer />
          </CartProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}