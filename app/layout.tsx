import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConditionalTopNav from "../components/ConditionalTopNav";
import NextTopLoader from 'nextjs-toploader';

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
        className={`${geistSans.variable} font-sans antialiased min-h-screen flex flex-col bg-[#FAFAF9] dark:bg-[#18181B] text-[#1A1A18] dark:text-[#FAFAF9] transition-colors duration-150`}
      >
        <NextTopLoader 
          color="#6366f1" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={false} 
          easing="ease" 
          speed={200} 
          shadow="0 0 10px #6366f1,0 0 5px #6366f1" 
        />
        <ConditionalTopNav />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
