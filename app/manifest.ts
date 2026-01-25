import type { MetadataRoute } from "next";
import { minikitConfig } from "../minikit.config";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: minikitConfig.miniapp.name,
        short_name: minikitConfig.miniapp.name,
        description: minikitConfig.miniapp.description,
        start_url: "/",
        display: "standalone",
        background_color: minikitConfig.miniapp.splashBackgroundColor,
        theme_color: minikitConfig.miniapp.splashBackgroundColor,
        icons: [
            {
                src: minikitConfig.miniapp.iconUrl,
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: minikitConfig.miniapp.iconUrl,
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
