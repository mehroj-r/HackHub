import type { Metadata, Viewport } from "next";
import { Geist_Mono, Space_Grotesk, Unbounded } from "next/font/google";
import { Suspense } from "react";

import { NoticeToast } from "@/components/layout/notice-toast";
import { TabBar } from "@/components/layout/tab-bar";
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

// The "HackHub" wordmark only (components/brand/logo.tsx, DESIGN.md).
const unbounded = Unbounded({
  variable: "--font-wordmark",
  subsets: ["latin"],
  weight: "800",
});

export const metadata: Metadata = {
  title: "HackHub",
  description: "Run a hackathon from registration to final ranking.",
};

// The browser chrome matches the Scoreboard ground (#0C0A08).
export const viewport: Viewport = {
  themeColor: "#0C0A08",
  colorScheme: "dark",
};

// Dark only (DESIGN.md: the Scoreboard theme has no light mode). The theme
// tokens live in globals.css; `dark` on <html> turns on the dark: variants the
// shadcn components use.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${geistMono.variable} ${unbounded.variable}`}
    >
      <body className="bg-background text-foreground font-sans antialiased">
        {/* The session is read inside Suspense: Cache Components is on. */}
        <Suspense fallback={<SiteHeaderSkeleton />}>
          <SiteHeader />
        </Suspense>
        {children}
        {/* Phones: the role's bottom tab bar (reads the session). */}
        <Suspense fallback={null}>
          <TabBar />
        </Suspense>
        <Suspense fallback={null}>
          <NoticeToast />
        </Suspense>
        {/* Toasts are a "live" moment: their icon takes the live red. */}
        <Toaster
          theme="dark"
          toastOptions={{ classNames: { toast: "cn-toast", icon: "text-live" } }}
        />
      </body>
    </html>
  );
}
