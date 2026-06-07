import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConditionalTopNav from "../components/ConditionalTopNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "dailycatrc | Daily CAT exam Reading Comprehension practice",
  description: "One CAT-level RC every day. Track your progress. Beat the leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} font-sans antialiased min-h-screen flex flex-col bg-[#FAFAF9] dark:bg-[#121211] text-[#1A1A18] dark:text-[#FAFAF9] transition-colors duration-150`}
      >
        <ConditionalTopNav />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
