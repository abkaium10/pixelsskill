import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { getSetting } from "@/lib/cms";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSetting("site").catch(() => ({} as Record<string, string>));
  return { metadataBase: new URL(SITE_URL), title: { default: s.siteName || "PixelSkill", template: s.seoTitleTemplate || "%s | PixelSkill" }, description: s.defaultDescription,
    verification: s.googleVerification || s.bingVerification ? { google: s.googleVerification || undefined, other: s.bingVerification ? { "msvalidate.01": s.bingVerification } : undefined } : undefined,
    icons: undefined, applicationName: s.siteName };
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={`${display.variable} ${sans.variable}`}><body className="font-sans antialiased">{children}</body></html>);
}
