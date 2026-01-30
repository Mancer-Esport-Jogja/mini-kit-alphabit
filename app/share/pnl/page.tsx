import { Metadata } from "next";

const ROOT_URL = process.env.NEXT_PUBLIC_URL || "https://mini-kit-alphabit.vercel.app";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const pnl = (params.pnl as string) || '0';
  const username = (params.username as string) || 'Player';
  const color = (params.color as string) || '#4ade80';
  
  const pnlNum = parseFloat(pnl);
  const isProfit = pnlNum >= 0;
  
  // Build OG image URL with color
  let ogImageUrl = `${ROOT_URL}/api/og/share-pnl?pnl=${encodeURIComponent(pnl)}&username=${encodeURIComponent(username)}`;
  if (color) {
    ogImageUrl += `&color=${encodeURIComponent(color)}`;
  }
  
  const embedData = {
    version: "1",
    imageUrl: ogImageUrl,
    button: {
      title: "🚀 Play Alphabit",
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
    title: `${username}'s PNL: ${isProfit ? '+' : ''}${pnlNum.toFixed(2)} USDC | Alphabit`,
    description: `Check out ${username}'s trading performance on Alphabit!`,
    openGraph: {
      title: `${username}'s PNL on Alphabit`,
      description: `${isProfit ? '+' : ''}${pnlNum.toFixed(2)} USDC - Let's Trade`,
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

export default function SharePnLPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <p className="text-bit-green font-pixel text-lg mb-2">🚀 ALPHABIT</p>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    </div>
  );
}
