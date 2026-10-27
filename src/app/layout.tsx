import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";

import { NoticeToast } from "@/components/layout/notice-toast";
import {
  SiteHeader,
  SiteHeaderSkeleton,
} from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Monospace, for invite codes and other things people read out or copy.
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HackHub",
  description: "Run a hackathon from registration to final ranking.",
};

// Dark only this week (docs/08 > Style guide: dark mode is optional). The
// theme tokens live in globals.css; `dark` on <html> turns on the dark: variants
// the shadcn components use.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${geistMono.variable}`}
    >
      <body className="bg-background text-foreground font-sans antialiased">
        {/* The session is read inside Suspense: Cache Components is on. */}
        <Suspense fallback={<SiteHeaderSkeleton />}>
          <SiteHeader />
        </Suspense>
        {children}
        <Suspense fallback={null}>
          <NoticeToast />
        </Suspense>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
