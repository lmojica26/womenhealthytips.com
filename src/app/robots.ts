import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://womenhealthytips.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/sign-in/",
          "/sign-up/",
          "/_next/",
          "/static/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
