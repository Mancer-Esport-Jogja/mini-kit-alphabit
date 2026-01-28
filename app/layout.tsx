import type { Metadata } from "next";
import { Inter, Press_Start_2P, Space_Grotesk } from "next/font/google";

import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import "./globals.css";
import DevConsoleViewer from "@/components/DevConsoleViewer";
import { DroidDrawer } from "@/components/droid/DroidDrawer";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    other: {
      "base:app_id": "697799c888e3bac59cf3d9ed",
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: "Play Now",
          action: {
            type: "launch_miniapp",
            name: minikitConfig.miniapp.name,
            url: minikitConfig.miniapp.homeUrl,
            splashImageUrl: minikitConfig.miniapp.splashImageUrl,
            splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
          },
        },
      }),
    },
    openGraph: {
      title: minikitConfig.miniapp.name,
      description: minikitConfig.miniapp.description,
      url: minikitConfig.miniapp.homeUrl,
      siteName: minikitConfig.miniapp.name,
      images: [
        {
          url: minikitConfig.miniapp.ogImageUrl || minikitConfig.miniapp.iconUrl,
          width: 1200,
          height: 630,
          alt: minikitConfig.miniapp.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: minikitConfig.miniapp.name,
      description: minikitConfig.miniapp.description,
      images: [minikitConfig.miniapp.ogImageUrl || minikitConfig.miniapp.iconUrl],
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  variable: "--font-pixel",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@coinbase/onchainkit@latest/styles.css" />
      </head>
      <body className={`${inter.variable} ${pressStart2P.variable} ${spaceGrotesk.variable}`}>
        <RootProvider>
          {children}
          <div className="z-[100] relative">
            <DroidDrawer />
          </div>
          <DevConsoleViewer />
        </RootProvider>
      </body>
    </html>
  );
}

