import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://godstimefoods.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/checkout",
        "/cart",
        "/profile",
        "/orders/",
        "/addresses",
        "/inbox",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
