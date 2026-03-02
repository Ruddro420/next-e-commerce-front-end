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

async function getGeneralSettings() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}/api/settings/general`, {
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}


//Dynamic metadata (title + favicon)
export async function generateMetadata() {
  const settings = await getGeneralSettings();

  const siteName = settings?.software_name || "My Shop";
  const logoUrl = settings?.logo_url;
  console.log(logoUrl);

  const favicon = logoUrl ? logoUrl : "/favicon.ico";

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: "Ecommerce website",
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}



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