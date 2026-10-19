import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Godstime Foods",
    short_name: "Godstime",
    description: "Order delicious meals directly to your doorstep",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#9333ea",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
