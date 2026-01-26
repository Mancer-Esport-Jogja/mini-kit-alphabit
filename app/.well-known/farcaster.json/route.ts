import { minikitConfig } from "@/minikit.config";
import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    accountAssociation: minikitConfig.accountAssociation,
    frame: {
      version: minikitConfig.miniapp.version,
      name: minikitConfig.miniapp.name,
      description: minikitConfig.miniapp.description,
      subtitle: minikitConfig.miniapp.subtitle,
      iconUrl: minikitConfig.miniapp.iconUrl,
      homeUrl: minikitConfig.miniapp.homeUrl,
      imageUrl: minikitConfig.miniapp.heroImageUrl,
      buttonTitle: `Launch ${minikitConfig.miniapp.name}`,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      webhookUrl: minikitConfig.miniapp.webhookUrl,
      primaryCategory: minikitConfig.miniapp.primaryCategory,
      tags: minikitConfig.miniapp.tags,
      screenshotUrls: minikitConfig.miniapp.screenshotUrls,
      tagline: minikitConfig.miniapp.tagline,
    },
  };

  return NextResponse.json(config);
}
