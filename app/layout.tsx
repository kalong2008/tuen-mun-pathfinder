import type { Metadata } from "next";
import { Noto_Sans_HK } from "next/font/google";
import "./globals.css";
import SideNav from "@/app/ui/nagivation";
import FooterComponent from "./ui/footer";

const notoHK = Noto_Sans_HK({ preload: false, });

export const metadata: Metadata = {
  title: "屯門前鋒會 幼鋒會 | 基督復臨安息日會屯門教會",
  description: "tuen mun pathfinder and adventurer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={notoHK.className}>
        <div><SideNav />{children}</div>
        <FooterComponent />
      </body>
    </html>
  );
}
