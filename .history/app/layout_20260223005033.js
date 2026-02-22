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
    default: "My Shop", // default title if a page doesn’t set one
    template: "%s | My Shop", // page title becomes: "Login | My Shop"
  },
  description: "Ecommerce website",
  icons: {
    icon: "/favicon.ico", // put this file in /public
    // optional extras if you add them in /public:
    // shortcut: "/favicon.ico",
    // apple: "/apple-touch-icon.png",
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