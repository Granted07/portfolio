import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site-header";
import { Footer } from "@/components/site-footer";
import { PageTransition } from "@/components/page-transition";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://anjishnu.dev"),
  title: {
    default: "Anjishnu Dey — Computer Science Engineer",
    template: "%s — Anjishnu Dey",
  },
  description:
    "Computer Science engineer and full stack developer building calm, resilient systems with a design-led mindset.",
  openGraph: {
    title: "Anjishnu Dey — Computer Science Engineer",
    description:
      "Computer Science engineer and full stack developer building calm, resilient systems with a design-led mindset.",
    url: "https://anjishnu.dev",
    siteName: "Anjishnu Dey",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anjishnu Dey — Computer Science Engineer",
    description:
      "Computer Science engineer and full stack developer building calm, resilient systems with a design-led mindset.",
  },
  alternates: {
    canonical: "https://anjishnu.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} bg-background text-foreground antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <PageTransition>
            <main className="flex-1 px-6 pb-24 pt-28 sm:px-10 md:px-16">
              {children}
            </main>
          </PageTransition>
          <Footer />
        </div>
      </body>
    </html>
  );
}
