import type { Metadata } from "next";
import { Noto_Sans_HK } from "next/font/google";
import "./globals.css";
import SideNav from "@/app/ui/nagivation";
import FooterComponent from "./ui/footer";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { GoogleTagManager } from '@next/third-parties/google'
import * as motion from "motion/react-client";
import { ClerkProvider } from "@clerk/nextjs";

const notoHK = Noto_Sans_HK({ preload: false, });

export const metadata: Metadata = {
  title: "屯門前鋒會 幼鋒會 | 基督復臨安息日會屯門教會",
  description: "屯門前鋒會及幼鋒會(6-15歲)提供信仰為本的全人發展培訓。透過歷奇、服務與技能學習，促進兒童及青少年在品格、領導力、生活技能、愛心，以至情緒管理方面的成長。歡迎加入！",
  openGraph: {
    title: '屯門前鋒會 幼鋒會 | 基督復臨安息日會屯門教會',
    description: '屯門前鋒會及幼鋒會(6-15歲)提供信仰為本的全人發展培訓。透過歷奇、服務與技能學習，促進兒童及青少年在品格、領導力、生活技能、愛心，以至情緒管理方面的成長。歡迎加入！',
    url: 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL,
    images: [
      {
        url: 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL + '/photo/2025/2025-08-promotion/2025-08-promotion-54.jpg',
        width: 4000,
        height: 1610,
        alt: '屯門前鋒會 幼鋒會 | 基督復臨安息日會屯門教會',
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
    appearance={{
      layout: {
        unsafe_disableDevelopmentModeWarnings: true,
      },
    }}
    >
      <html lang="en">
        <GoogleTagManager gtmId="GTM-W2DGN4G" />
        <body className={notoHK.className}>
          <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            //delay: 0.4,
            duration: 0.2,
            scale: { type: "spring", visualDuration: 0.2, bounce: 0.2 },
          }}
        >
          <div><SideNav />{children}
            <SpeedInsights />
            <Analytics /></div>
          <FooterComponent />
        </motion.div>
      </body>
    </html>
    </ClerkProvider>
  );
}
