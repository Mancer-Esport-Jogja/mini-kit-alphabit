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
    name: "Alphabit",
    subtitle: "Find Alpha in The Bits. 👾",
    description: "Alphabit is the simplified option trade. Gamification option trade on Base App",
    screenshotUrls: [`${ROOT_URL}/hero.png`],
    iconUrl: `${ROOT_URL}/logo-alphabit.png`,
    imageUrl: `${ROOT_URL}/logo-alphabit.png`,
    splashImageUrl: `${ROOT_URL}/logo-alphabit.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `https://api.neynar.com/f/app/09a5deb5-30e1-499b-b330-c4284fa8d6dd/event`,
    primaryCategory: "finance",
    tags: ["trading", "crypto", "options", "defi", "finance", "games"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Trade Options on Farcaster",
    ogTitle: "Alphabit - Gamification Option Trading",
    ogDescription: "Alphabit is the simplified option trade. Gamification option trade on Base App.",
    ogImageUrl: `${ROOT_URL}/logo-alphabit.png`,
  },
} as const;
