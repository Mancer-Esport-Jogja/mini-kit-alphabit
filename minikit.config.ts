const ROOT_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjEzNzI0OTUsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1MDdmOEUyN2E4NjBkQjM3Yzk4NzZGODhjZDlFYzQ0NDdlODU0QjliIn0",
    payload: "eyJkb21haW4iOiJtaW5pLWtpdC1hbHBoYWJpdC52ZXJjZWwuYXBwIn0",
    signature:
      "/DUTTaDURugyl0NUcLTVibVh1PxXGaOyFOd+WDAnB1MYH56myqGEbiUbb+RGhyRa4rp5v/SmrgCBQhwhgeADaRw=",
  },
  baseBuilder: {
    ownerAddress: "",
  },
  miniapp: {
    version: "1",
    name: "alphabit",
    subtitle: "Simple Crypto Options Trading",
    description: "Alphabit is the easiest way to trade options on Farcaster. Trade calls and puts with ease.",
    screenshotUrls: [`${ROOT_URL}/hero.png`],
    iconUrl: `${ROOT_URL}/logo-alphabit.png`,
    splashImageUrl: `${ROOT_URL}/logo-alphabit.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "finance",
    tags: ["trading", "crypto", "options", "defi", "finance"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Trade Options on Farcaster",
    ogTitle: "Alphabit - Crypto Options Trading",
    ogDescription: "The easiest way to trade crypto options directly on Farcaster. Simple, fast, and secure.",
    ogImageUrl: `${ROOT_URL}/logo-alphabit.png`,
  },
} as const;
