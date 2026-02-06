import { Metadata } from "next";

const ROOT_URL = process.env.NEXT_PUBLIC_URL || "https://mini-kit-alphabit.vercel.app";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const asset = (params.asset as string) || 'ETH';
  const direction = (params.direction as string) || 'MOON';
  const strike = (params.strike as string) || '0';
  const username = (params.username as string) || 'Player';
  const color = (params.color as string) || '4ade80';
  
  // Build OG image URL
  const ogImageUrl = `${ROOT_URL}/api/og/share-arcade?asset=${asset}&direction=${direction}&strike=${strike}&username=${encodeURIComponent(username)}&color=${color}`;
  
  const embedData = {
    version: "1",
    imageUrl: ogImageUrl,
    button: {
      title: "📈 Play Alphabit",
      action: {
        type: "launch_miniapp",
        name: "Alphabit",
        url: ROOT_URL,
        splashImageUrl: `${ROOT_URL}/logo-alphabit.png`,
        splashBackgroundColor: "#000000",
      },
    },
  };

  return {
    title: `${username}'s ${direction} mission on ${asset} | Alphabit`,
    description: `Check out ${username}'s successful Arcade mission on Alphabit!`,
    openGraph: {
      title: `${username}'s Arcade Mission on Alphabit`,
      description: `${direction} on ${asset} at $${strike}`,
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
      }],
    },
    other: {
      "fc:miniapp": JSON.stringify(embedData),
      "fc:frame": JSON.stringify({
        ...embedData,
        button: {
          ...embedData.button,
          action: { ...embedData.button.action, type: "launch_frame" }
        }
      }),
    },
  };
}

export default function ShareArcadePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <p className="text-emerald-400 font-pixel text-lg mb-2">🕹️ ALPHABIT ARCADE</p>
          <p className="text-slate-500 text-sm">Synchronizing Mission Data...</p>
        </div>
      </div>
    </div>
  );
}
