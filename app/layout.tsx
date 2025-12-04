import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NBA Fantasy Lab",
  description:
    "Experiment with NBA fantasy teams in a sandbox environment, explore player stats, and test different lineups.",
  keywords: ["NBA", "Fantasy", "Simulator", "Sandbox", "Player Stats", "Team Lab"],
  authors: [{ name: "Your Name" }],
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },         // fallback
      { url: "/favicon-96x96.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",                          // iOS devices
    other: [
      { rel: "manifest", url: "/site.webmanifest" },         // PWA
    ],
  },
  openGraph: {
    title: "NBA Fantasy Lab",
    description:
      "Experiment with NBA fantasy teams in a sandbox environment, explore player stats, and test different lineups.",
    url: "https://yourdomain.com",
    siteName: "NBA Fantasy Lab",
    images: [
      { url: "/favicon-96x96.png", width: 96, height: 96, alt: "NBA Fantasy Lab" },
      { url: "/favicon-512x512.png", width: 512, height: 512, alt: "NBA Fantasy Lab" },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NBA Fantasy Lab",
    description:
      "Experiment with NBA fantasy teams in a sandbox environment, explore player stats, and test different lineups.",
    images: ["/favicon-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200`}
      >
        <div className="flex justify-center font-sans">
          <main className="flex flex-col w-full min-h-screen max-w-400">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
