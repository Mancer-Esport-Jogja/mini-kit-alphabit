import { Metadata } from "next";

const ROOT_URL = process.env.NEXT_PUBLIC_URL || "https://mini-kit-alphabit.vercel.app";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const pnl = (params.pnl as string) || '0';
  const username = (params.username as string) || 'Trader';
  const winrate = (params.winrate as string) || '0';
  const missions = (params.missions as string) || '0';
  
  const pnlNum = parseFloat(pnl);
  const isProfit = pnlNum >= 0;
  
  const embedData = {
    version: "1",
    imageUrl: `${ROOT_URL}/api/og/share-performance?pnl=${encodeURIComponent(pnl)}&username=${encodeURIComponent(username)}&winrate=${encodeURIComponent(winrate)}&missions=${encodeURIComponent(missions)}`,
    button: {
      title: "📈 Trade on Alphabit",
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
    title: `${username}'s Trading Performance | Alphabit`,
    description: `PNL: ${isProfit ? '+' : ''}${pnlNum.toFixed(2)} USDC | Win Rate: ${parseFloat(winrate).toFixed(1)}% | ${missions} Missions`,
    openGraph: {
      title: `${username}'s Trading Performance on Alphabit`,
      description: `Check out the full trading stats on Farcaster`,
      images: [{
        url: `${ROOT_URL}/api/og/share-performance?pnl=${encodeURIComponent(pnl)}&username=${encodeURIComponent(username)}&winrate=${encodeURIComponent(winrate)}&missions=${encodeURIComponent(missions)}`,
        width: 1200,
        height: 800,
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
