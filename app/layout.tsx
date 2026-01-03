import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrentBookProvider } from "@/contexts/CurrentBookContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book Quest",
  description: "Your literary adventure companion",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="debug-grid">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* App container - this is the frame boundary */}
        <div className="app-container">
          <CurrentBookProvider>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
          </CurrentBookProvider>
        </div>
      </body>
    </html>
  );
}
