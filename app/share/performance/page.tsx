import { Metadata } from "next";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

const ROOT_URL = process.env.NEXT_PUBLIC_URL || "https://mini-kit-alphabit.vercel.app";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const pnl = (params.pnl as string) || '0';
  const username = (params.username as string) || 'Player';
  const winrate = (params.winrate as string) || '0';
  const missions = (params.missions as string) || '0';
  const chart = (params.chart as string) || '';
  const color = (params.color as string) || '#4ade80';
  const t = (params.t as string) || '';
  
  // Resolve dynamic host to ensure OG image is fetched from the correct environment
  const headersList = await headers();
  const host = headersList.get('host') || 'mini-kit-alphabit.vercel.app';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const dynamicRootUrl = `${protocol}://${host}`;

  const pnlNum = parseFloat(pnl);
  const isProfit = pnlNum >= 0;
  
  // Build OG image URL with chart data and color if available
  // Use dynamicRootUrl for the image source so it points to the current deployment/tunnel
  let ogImageUrl = `${dynamicRootUrl}/api/og/share-performance?pnl=${encodeURIComponent(pnl)}&username=${encodeURIComponent(username)}&winrate=${encodeURIComponent(winrate)}&missions=${encodeURIComponent(missions)}`;
  if (chart) {
    ogImageUrl += `&chart=${encodeURIComponent(chart)}`;
  }
  if (color) {
    ogImageUrl += `&color=${encodeURIComponent(color)}`;
  }
  if (t) {
    ogImageUrl += `&t=${encodeURIComponent(t)}`;
  }
  
  const embedData = {
    version: "1",
    imageUrl: ogImageUrl,
    button: {
      title: "📈 Play Alphabit",
      action: {
        type: "launch_miniapp",
        name: "Alphabit",
        url: ROOT_URL, // Keep this as the canonical Main App URL
        splashImageUrl: `${ROOT_URL}/logo-alphabit.png`,
        splashBackgroundColor: "#000000",
      },
    },
  };

  return {
    title: `${username}'s Trading Performance | Alphabit`,
    description: `PNL: ${isProfit ? '+' : ''}${pnlNum.toFixed(2)} USDC | Win Rate: ${parseFloat(winrate).toFixed(1)}% | ${missions} Missions`,
    openGraph: {
      title: `${username}'s Trading Performance on Alphabit`,
      description: `Check out the full trading stats on Farcaster`,
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630, // Updated to match new OG dimensions
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

export default function SharePerformancePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <p className="text-orange-400 font-pixel text-lg mb-2">📈 ALPHABIT</p>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    </div>
  );
}
