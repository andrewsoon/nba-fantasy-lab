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
  title: "NBA Fantasy Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200`}
      >
        <div className="flex justify-center font-sans">
          <main className="flex flex-col w-full min-h-screen max-w-350 bg-zinc-100 dark:bg-zinc-900">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
