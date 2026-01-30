import { Metadata } from "next";

const ROOT_URL = process.env.NEXT_PUBLIC_URL || "https://mini-kit-alphabit.vercel.app";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const missions = (params.missions as string) || '0';
  const username = (params.username as string) || 'Player';
  
  const missionsNum = parseInt(missions);
  
  const embedData = {
    version: "1",
    imageUrl: `${ROOT_URL}/api/og/share-missions?missions=${encodeURIComponent(missions)}&username=${encodeURIComponent(username)}`,
    button: {
      title: "🎮 Play on Alphabit",
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
    title: `${username} completed ${missionsNum} missions | Alphabit`,
    description: `${username} has completed ${missionsNum} trading missions on Alphabit!`,
    openGraph: {
      title: `${username}'s Trading Journey on Alphabit`,
      description: `${missionsNum} missions completed - Let's Trade`,
      images: [{
        url: `${ROOT_URL}/api/og/share-missions?missions=${encodeURIComponent(missions)}&username=${encodeURIComponent(username)}`,
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

export default function ShareMissionsPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <p className="text-purple-400 font-pixel text-lg mb-2">🎮 ALPHABIT</p>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    </div>
  );
}
