import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryNav from "@/components/layout/CategoryNav";
import { CartProvider } from "@/store/cartStore";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import ServiceHighlights from "@/components/layout/ServiceHighlights";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// ✅ Global default title + template + favicon/icons
export const metadata = {
  title: {
    default: "My Shop",
    template: "%s | My Shop",
  },
  description: "Ecommerce website",
  icons: {
    icon: "/favicon.ico",     // main favicon
    shortcut: "/favicon.ico", // optional
    apple: "/apple-touch-icon.png", // optional (if exists)
  },
};


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
            <ServiceHighlights />
            <Footer />
          </CartProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}