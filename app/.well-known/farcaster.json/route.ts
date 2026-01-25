import { minikitConfig } from "@/minikit.config";
import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjEzNzI0OTUsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1MDdmOEUyN2E4NjBkQjM3Yzk4NzZGODhjZDlFYzQ0NDdlODU0QjliIn0",
      payload: "eyJkb21haW4iOiJtaW5pLWtpdC1hbHBoYWJpdC52ZXJjZWwuYXBwIn0",
      signature:
        "/DUTTaDURugyl0NUcLTVibVh1PxXGaOyFOd+WDAnB1MYH56myqGEbiUbb+RGhyRa4rp5v/SmrgCBQhwhgeADaRw=",
    },
    frame: {
      version: minikitConfig.miniapp.version,
      name: minikitConfig.miniapp.name,
      iconUrl: minikitConfig.miniapp.iconUrl,
      homeUrl: minikitConfig.miniapp.homeUrl,
      imageUrl: minikitConfig.miniapp.heroImageUrl,
      buttonTitle: `Launch ${minikitConfig.miniapp.name}`,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      webhookUrl: minikitConfig.miniapp.webhookUrl,
    },
  };

  return NextResponse.json(config);
}
