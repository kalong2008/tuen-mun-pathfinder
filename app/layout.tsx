import type { Metadata } from "next";
import { Noto_Sans_HK } from "next/font/google";
import "./globals.css";
import SideNav from "@/app/ui/nagivation";
import FooterComponent from "./ui/footer";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { GoogleTagManager } from '@next/third-parties/google'
import * as motion from "motion/react-client";

const notoHK = Noto_Sans_HK({ preload: false, });

export const metadata: Metadata = {
  title: "屯門前鋒會 幼鋒會 | 基督復臨安息日會屯門教會",
  description: "屯門前鋒會 幼鋒會 | 基督復臨安息日會屯門教會",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-W2DGN4G" />
      <body className={notoHK.className}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.4,
            duration: 1,
            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
          }}
        >
          <div><SideNav />{children}
            <SpeedInsights />
            <Analytics /></div>
          <FooterComponent />
        </motion.div>
      </body>
    </html>
  );
}
