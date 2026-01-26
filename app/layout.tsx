import type { Metadata } from "next";
import { Inter, Press_Start_2P, Space_Grotesk } from "next/font/google";

import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import "./globals.css";
import DevConsoleViewer from "@/components/DevConsoleViewer";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    other: {
      "fc:miniapp": JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: `Launch ${minikitConfig.miniapp.name}`,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: "launch_miniapp",
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
        <meta name="base:app_id" content="697799c888e3bac59cf3d9ed" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@coinbase/onchainkit@latest/styles.css" />
      </head>
      <body className={`${inter.variable} ${pressStart2P.variable} ${spaceGrotesk.variable}`}>
        <RootProvider>
          {children}
          <DevConsoleViewer />
        </RootProvider>
      </body>
    </html>
  );
}

