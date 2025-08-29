import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/error-boundary";
import WindowHeader from "@/components/window/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GarageGuru - Enterprise Garage Sale",
  description:
    "Discover, list, and manage enterprise garage sales effortlessly.",
  openGraph: {
    title: "GarageGuru - Enterprise Garage Sale",
    description:
      "Discover, list, and manage enterprise garage sales effortlessly.",
    url: "https://garageguru.example.com",
    siteName: "GarageGuru",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GarageGuru logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GarageGuru - Enterprise Garage Sale",
    description:
      "Discover, list, and manage enterprise garage sales effortlessly.",
    images: ["/og-image.png"],
    creator: "@GarageGuru",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <WindowHeader />
          <Providers>{children}</Providers>
          <Toaster closeButton />
        </ErrorBoundary>
      </body>
    </html>
  );
}
