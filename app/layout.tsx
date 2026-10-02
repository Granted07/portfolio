import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Field } from "@/components/field";

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://anjishnu.dev"),
  title: { default: "Anjishnu Dey", template: "%s — Anjishnu Dey" },
  description: "Computer Science engineer and full stack developer. Scroll to find out.",
  openGraph: { title: "Anjishnu Dey", url: "https://anjishnu.dev", siteName: "Anjishnu Dey", type: "website" },
  alternates: { canonical: "https://anjishnu.dev" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mono.variable} bg-background text-foreground`}>
        <SmoothScroll>
          <Field />
          <main className="relative z-10">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
