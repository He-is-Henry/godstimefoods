import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import MustChangePasswordBanner from "@/components/auth/MustChangePasswordBanner";
import CartContextProvider from "@/context/CartContext";
import { MessagesProvider } from "@/context/MessagesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Godstime Foods",
    template: "%s - Godstime Foods",
  },
  description: "Order delicious meals directly to your doorstep",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Godstime Foods",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthProvider>
      <CartContextProvider>
        <MessagesProvider>
          <MustChangePasswordBanner />
          <Toaster />
          <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
          >
            <body className="min-h-full flex flex-col">{children}</body>
          </html>
        </MessagesProvider>
      </CartContextProvider>
    </AuthProvider>
  );
}